import { useState, useEffect, useCallback } from "react";
import { Tour, TourStep } from "@/lib/tour/types";

const STORAGE_KEY = "footprintiq_tour_seen_v1";

interface TourProgress {
  [tourId: string]: {
    completed: boolean;
    currentStep: number;
    lastSeen: string;
  };
}

export function useTour(tour: Tour) {
  const [isActive, setIsActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progress, setProgress] = useState<TourProgress>({});

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setProgress(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse tour progress:", e);
      }
    }
  }, []);

  const saveProgress = useCallback((tourId: string, stepIndex: number, completed: boolean) => {
    const newProgress = {
      ...progress,
      [tourId]: {
        completed,
        currentStep: stepIndex,
        lastSeen: new Date().toISOString()
      }
    };
    setProgress(newProgress);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newProgress));
  }, [progress]);

  const startTour = useCallback(() => {
    const savedProgress = progress[tour.id];
    setCurrentStepIndex(savedProgress?.completed ? 0 : savedProgress?.currentStep || 0);
    setIsActive(true);
  }, [tour.id, progress]);

  const nextStep = useCallback(() => {
    if (currentStepIndex < tour.steps.length - 1) {
      const newIndex = currentStepIndex + 1;
      setCurrentStepIndex(newIndex);
      saveProgress(tour.id, newIndex, false);
    } else {
      endTour();
    }
  }, [currentStepIndex, tour.steps.length, tour.id, saveProgress]);

  const prevStep = useCallback(() => {
    if (currentStepIndex > 0) {
      const newIndex = currentStepIndex - 1;
      setCurrentStepIndex(newIndex);
      saveProgress(tour.id, newIndex, false);
    }
  }, [currentStepIndex, tour.id, saveProgress]);

  const endTour = useCallback(() => {
    saveProgress(tour.id, tour.steps.length, true);
    setIsActive(false);
  }, [tour.id, tour.steps.length, saveProgress]);

  const resetTour = useCallback(() => {
    setCurrentStepIndex(0);
    saveProgress(tour.id, 0, false);
  }, [tour.id, saveProgress]);

  const hasCompletedTour = useCallback((tourId: string) => {
    return progress[tourId]?.completed || false;
  }, [progress]);

  useEffect(() => {
    if (!isActive) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        endTour();
      } else if (e.key === "ArrowRight") {
        nextStep();
      } else if (e.key === "ArrowLeft") {
        prevStep();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isActive, nextStep, prevStep, endTour]);

  return {
    isActive,
    currentStep: tour.steps[currentStepIndex],
    currentStepIndex,
    totalSteps: tour.steps.length,
    startTour,
    nextStep,
    prevStep,
    endTour,
    resetTour,
    hasCompletedTour
  };
}
