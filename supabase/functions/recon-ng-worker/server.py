#!/usr/bin/env python3
"""
Recon-ng CLI Executor
Handles direct execution of recon-ng commands
"""

import subprocess
import tempfile
import os
import json
import re
from typing import Dict, List, Any

class ReconNgExecutor:
    def __init__(self):
        self.workspaces_dir = '/root/.recon-ng/workspaces'
        
    def execute_scan(self, target: str, modules: List[str], workspace: str = None) -> Dict[str, Any]:
        """Execute recon-ng scan with specified modules"""
        if not workspace:
            workspace = f"scan_{target.replace('.', '_').replace('@', '_')}"
        
        try:
            # Create resource script
            script_content = self._build_script(target, modules, workspace)
            
            with tempfile.NamedTemporaryFile(mode='w', suffix='.rc', delete=False) as script:
                script.write(script_content)
                script_path = script.name
            
            print(f"[ReconNG] Executing scan for {target} with {len(modules)} modules")
            
            # Execute recon-ng with script
            result = subprocess.run(
                ['recon-ng', '-r', script_path],
                capture_output=True,
                text=True,
                timeout=300,
                env=os.environ.copy()
            )
            
            # Clean up script
            os.unlink(script_path)
            
            # Parse results
            parsed_results = self._parse_output(result.stdout, workspace)
            
            return {
                'success': result.returncode == 0,
                'workspace': workspace,
                'results': parsed_results['results'],
                'hosts': parsed_results['hosts'],
                'contacts': parsed_results['contacts'],
                'locations': parsed_results['locations'],
                'raw_output': result.stdout[-2000:],  # Last 2000 chars
                'errors': result.stderr if result.returncode != 0 else None
            }
            
        except subprocess.TimeoutExpired:
            return {
                'success': False,
                'error': 'Scan timed out after 300 seconds',
                'results': []
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'results': []
            }
    
    def _build_script(self, target: str, modules: List[str], workspace: str) -> str:
        """Build recon-ng resource script"""
        script_lines = [
            f"workspaces create {workspace}",
            f"workspaces load {workspace}",
        ]
        
        for module in modules:
            script_lines.extend([
                f"modules load {module}",
                f"options set SOURCE {target}",
                "run",
            ])
        
        # Export data
        script_lines.extend([
            "show hosts",
            "show contacts",
            "show locations",
            "show credentials",
        ])
        
        return "\n".join(script_lines)
    
    def _parse_output(self, output: str, workspace: str) -> Dict[str, Any]:
        """Parse recon-ng output to extract structured data"""
        results = {
            'results': [],
            'hosts': [],
            'contacts': [],
            'locations': []
        }
        
        lines = output.split('\n')
        current_section = None
        
        for line in lines:
            line = line.strip()
            
            # Detect sections
            if '[*]' in line and 'module' in line.lower():
                # Module execution line
                module_match = re.search(r'modules/(\S+)', line)
                if module_match:
                    current_section = module_match.group(1)
            
            # Extract results
            if '[+]' in line or 'Found' in line:
                result_entry = {
                    'module': current_section or 'unknown',
                    'type': self._detect_result_type(line),
                    'value': self._extract_value(line),
                    'raw': line
                }
                results['results'].append(result_entry)
            
            # Parse hosts table
            if '|' in line and not line.startswith('-'):
                if any(x in line.lower() for x in ['host', 'ip_address', 'domain']):
                    parts = [p.strip() for p in line.split('|') if p.strip()]
                    if len(parts) >= 2:
                        results['hosts'].append({
                            'host': parts[0],
                            'ip_address': parts[1] if len(parts) > 1 else None,
                        })
            
            # Parse contacts
            if 'email' in line.lower() or '@' in line:
                email_match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', line)
                if email_match:
                    results['contacts'].append({
                        'email': email_match.group(0),
                        'source': current_section or 'unknown'
                    })
        
        return results
    
    def _detect_result_type(self, line: str) -> str:
        """Detect the type of result from line content"""
        line_lower = line.lower()
        if 'email' in line_lower or '@' in line:
            return 'email'
        elif 'host' in line_lower or 'domain' in line_lower:
            return 'host'
        elif 'ip' in line_lower:
            return 'ip'
        elif 'profile' in line_lower or 'username' in line_lower:
            return 'profile'
        elif 'location' in line_lower:
            return 'location'
        else:
            return 'other'
    
    def _extract_value(self, line: str) -> str:
        """Extract the main value from a result line"""
        # Remove [+], [*], etc.
        cleaned = re.sub(r'\[\S+\]', '', line).strip()
        
        # Try to extract structured data
        if ':' in cleaned:
            parts = cleaned.split(':', 1)
            return parts[1].strip()
        
        return cleaned
    
    def list_modules(self) -> List[str]:
        """List available recon-ng modules"""
        try:
            result = subprocess.run(
                ['recon-ng', '-x', 'modules search'],
                capture_output=True,
                text=True,
                timeout=30
            )
            
            modules = []
            for line in result.stdout.split('\n'):
                if '/' in line and 'recon/' in line:
                    module = line.strip().split()[0]
                    modules.append(module)
            
            return modules
        except Exception as e:
            print(f"Error listing modules: {e}")
            return []
    
    def list_marketplace_modules(self) -> List[Dict[str, Any]]:
        """List all available modules from marketplace with details"""
        try:
            result = subprocess.run(
                ['recon-ng', '-w', 'default', '-x', 'marketplace search'],
                capture_output=True,
                text=True,
                timeout=30
            )
            
            modules = []
            for line in result.stdout.split('\n'):
                line = line.strip()
                if '|' in line and not line.startswith('|--'):
                    parts = [p.strip() for p in line.split('|')]
                    if len(parts) >= 4 and '/' in parts[1]:
                        modules.append({
                            'name': parts[1],
                            'version': parts[2] if len(parts) > 2 else '',
                            'status': parts[3] if len(parts) > 3 else 'not installed',
                            'updated': parts[4] if len(parts) > 4 else '',
                            'category': parts[1].split('/')[0] if '/' in parts[1] else 'unknown',
                            'installed': parts[3].lower() == 'installed' if len(parts) > 3 else False
                        })
            
            return modules
            
        except Exception as e:
            print(f"Error listing marketplace modules: {e}")
            return []
    
    def list_installed_modules(self) -> List[str]:
        """List installed modules only"""
        try:
            all_modules = self.list_marketplace_modules()
            return [m['name'] for m in all_modules if m.get('installed', False)]
        except Exception as e:
            print(f"Error listing installed modules: {e}")
            return []
    
    def install_module(self, module_name: str) -> Dict[str, Any]:
        """Install a module from marketplace"""
        try:
            print(f"Installing module: {module_name}")
            
            result = subprocess.run(
                ['recon-ng', '-w', 'default', '-x', f'marketplace install {module_name}'],
                capture_output=True,
                text=True,
                timeout=60
            )
            
            success = result.returncode == 0 and 'installed' in result.stdout.lower()
            
            return {
                'success': success,
                'module': module_name,
                'message': result.stdout if success else result.stderr,
                'output': result.stdout
            }
            
        except Exception as e:
            print(f"Error installing module {module_name}: {e}")
            return {
                'success': False,
                'module': module_name,
                'error': str(e)
            }
    
    def update_module(self, module_name: str) -> Dict[str, Any]:
        """Update an installed module"""
        try:
            print(f"Updating module: {module_name}")
            
            result = subprocess.run(
                ['recon-ng', '-w', 'default', '-x', f'marketplace update; marketplace install {module_name}'],
                capture_output=True,
                text=True,
                timeout=60
            )
            
            success = result.returncode == 0
            
            return {
                'success': success,
                'module': module_name,
                'message': result.stdout if success else result.stderr,
                'output': result.stdout
            }
            
        except Exception as e:
            print(f"Error updating module {module_name}: {e}")
            return {
                'success': False,
                'module': module_name,
                'error': str(e)
            }
    
    def get_module_info(self, module_name: str) -> Dict[str, Any]:
        """Get detailed information about a module"""
        try:
            result = subprocess.run(
                ['recon-ng', '-w', 'default', '-x', f'marketplace info {module_name}'],
                capture_output=True,
                text=True,
                timeout=30
            )
            
            info = {
                'name': module_name,
                'raw_output': result.stdout,
                'dependencies': []
            }
            
            # Parse key information and dependencies
            for line in result.stdout.split('\n'):
                line = line.strip()
                if ':' in line:
                    key, value = line.split(':', 1)
                    key = key.strip().lower().replace(' ', '_')
                    value = value.strip()
                    info[key] = value
                    
                    # Extract dependencies
                    if 'depend' in key.lower() and value:
                        deps = [d.strip() for d in value.split(',') if d.strip()]
                        info['dependencies'].extend(deps)
            
            return info
            
        except Exception as e:
            print(f"Error getting module info: {e}")
            return {'error': str(e)}
    
    def get_module_dependencies(self, module_name: str) -> List[str]:
        """Get dependencies for a module"""
        try:
            info = self.get_module_info(module_name)
            return info.get('dependencies', [])
        except Exception as e:
            print(f"Error getting dependencies: {e}")
            return []
    
    def resolve_dependencies(self, module_names: List[str]) -> Dict[str, Any]:
        """Resolve all dependencies for given modules"""
        try:
            all_modules = set(module_names)
            dependency_map = {}
            to_process = list(module_names)
            processed = set()
            
            while to_process:
                module = to_process.pop(0)
                if module in processed:
                    continue
                    
                processed.add(module)
                deps = self.get_module_dependencies(module)
                dependency_map[module] = deps
                
                # Add dependencies to processing queue
                for dep in deps:
                    if dep not in processed and dep not in to_process:
                        to_process.append(dep)
                        all_modules.add(dep)
            
            return {
                'modules': list(all_modules),
                'dependencies': dependency_map,
                'graph': self._build_dependency_graph(dependency_map)
            }
            
        except Exception as e:
            print(f"Error resolving dependencies: {e}")
            return {'modules': module_names, 'dependencies': {}, 'graph': []}
    
    def _build_dependency_graph(self, dependency_map: Dict[str, List[str]]) -> List[Dict[str, Any]]:
        """Build graph structure for visualization"""
        nodes = []
        edges = []
        
        for module, deps in dependency_map.items():
            nodes.append({
                'id': module,
                'label': module.split('/')[-1],
                'category': module.split('/')[0] if '/' in module else 'unknown'
            })
            
            for dep in deps:
                edges.append({
                    'source': module,
                    'target': dep
                })
        
        return {'nodes': nodes, 'edges': edges}

if __name__ == '__main__':
    # Test execution
    executor = ReconNgExecutor()
    result = executor.execute_scan('example.com', ['recon/domains-hosts/google_site_web'])
    print(json.dumps(result, indent=2))
