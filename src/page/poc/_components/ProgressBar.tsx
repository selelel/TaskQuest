import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Trophy, Gamepad2, Sword, Star } from "lucide-react";
import { ReactNode } from "react";

interface GameMilestone {
  percentage: number;
  label: string;
  icon: ReactNode;
  description: string;
  game: {
    name: string;
    locked: boolean;
    used: boolean;
  };
}

interface ProgressBarProps {
  completionPercentage: number;
  milestones: GameMilestone[];
  onPlayGame: (milestone: GameMilestone) => void;
}

export const GAME_MILESTONES: GameMilestone[] = [
  {
    percentage: 25,
    label: "Novice",
    icon: <Trophy className="h-4 w-4" />,
    description: "First milestone unlocked! Time for a quick gaming session.",
    game: {
      name: "Gaming Break - Level 1",
      locked: true,
      used: false
    }
  },
  {
    percentage: 50,
    label: "Explorer",
    icon: <Gamepad2 className="h-4 w-4" />,
    description: "Halfway champion! Reward yourself with some gaming time.",
    game: {
      name: "Gaming Break - Level 2",
      locked: true,
      used: false
    }
  },
  {
    percentage: 75,
    label: "Warrior",
    icon: <Sword className="h-4 w-4" />,
    description: "Almost at the finish line! Take a well-deserved break.",
    game: {
      name: "Gaming Break - Level 3",
      locked: true,
      used: false
    }
  },
  {
    percentage: 100,
    label: "Champion",
    icon: <Star className="h-4 w-4" />,
    description: "You're a legend! Celebrate with a final gaming session!",
    game: {
      name: "Gaming Break - Level 4",
      locked: true,
      used: false
    }
  }
];

export function ProgressBar({ completionPercentage, milestones, onPlayGame }: ProgressBarProps) {
  return (
    <div className="mb-10 mt-2">
      <div className="relative pt-8 pb-4">
        {/* Progress bar background with milestone dividers */}
        <div className="h-3 w-full bg-gray-200 rounded-full relative">
          {GAME_MILESTONES.map((milestone, index) => (
            index < GAME_MILESTONES.length - 1 && (
              <div
                key={milestone.percentage}
                className="absolute top-0 bottom-0 w-0.5 bg-white"
                style={{ left: `${milestone.percentage}%` }}
              />
            )
          ))}
          {/* Progress bar fill */}
          <Progress value={completionPercentage} className="h-3" />
        </div>

        {/* Milestone markers */}
        <div className="absolute top-0 left-0 w-full">
          {GAME_MILESTONES.map(milestone => (
            <div
              key={milestone.label}
              className="absolute transform -translate-x-1/2"
              style={{ left: `${milestone.percentage}%` }}
            >
              <div className="flex flex-col items-center">
                <span className="text-xs font-medium text-gray-600 whitespace-nowrap mb-1">
                  {milestone.label}
                </span>
                <div 
                  className={`p-1 rounded-full transition-all duration-300 ${
                    completionPercentage >= milestone.percentage 
                      ? 'bg-yellow-100 text-yellow-600 scale-110 transform' 
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {milestone.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Current progress label */}
        <div 
          className="absolute -bottom-6 transform -translate-x-1/2 transition-all duration-300"
          style={{ left: `${Math.min(Math.max(completionPercentage, 2), 98)}%` }}
        >
          <span className="text-sm font-medium text-blue-600 bg-white px-2 py-1 rounded-full shadow-sm border">
            {completionPercentage.toFixed(0)}%
          </span>
        </div>
      </div>

      {/* Game milestones list */}
      <div className="mt-8 space-y-2">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          <h2 className="text-lg font-semibold text-gray-800">Progress Milestones</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {milestones.map(milestone => (
            <div
              key={milestone.label}
              className={`p-3 rounded-lg border transition-all duration-300 ${
                milestone.game.used
                  ? 'bg-gray-100 border-gray-200 opacity-75'
                  : completionPercentage >= milestone.percentage
                    ? 'bg-yellow-50 border-yellow-200 shadow-sm'
                    : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className={`${
                  milestone.game.used
                    ? 'text-gray-400'
                    : completionPercentage >= milestone.percentage 
                      ? 'text-yellow-500' 
                      : 'text-gray-400'
                  }`}
                >
                  {milestone.icon}
                </div>
                <div className={`text-sm font-medium ${
                  milestone.game.used ? 'text-gray-500' : 'text-gray-900'
                }`}>
                  {milestone.label}
                </div>
                <div className={`ml-auto text-xs font-medium ${
                  milestone.game.used
                    ? 'text-gray-400'
                    : completionPercentage >= milestone.percentage
                      ? 'text-yellow-600'
                      : 'text-gray-500'
                }`}>
                  {milestone.percentage}%
                </div>
              </div>
              <p className={`text-xs mb-3 ${
                milestone.game.used ? 'text-gray-500' : 'text-gray-600'
              }`}>
                {milestone.game.used ? "Break already used - Come back tomorrow!" : milestone.description}
              </p>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className={`font-medium ${
                    milestone.game.used ? 'text-gray-500' : 'text-gray-700'
                  }`}>
                    {milestone.game.name}
                  </span>
                  <span className={`text-xs ${
                    milestone.game.used ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    30 min break
                  </span>
                </div>
                
                <Button 
                  className="w-full relative"
                  variant={
                    milestone.game.used
                      ? "secondary"
                      : completionPercentage >= milestone.percentage 
                        ? "default" 
                        : "secondary"
                  }
                  disabled={milestone.game.used || completionPercentage < milestone.percentage}
                  onClick={() => onPlayGame(milestone)}
                >
                  {milestone.game.used ? (
                    <>
                      <div className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-gray-400" />
                      <span className="text-gray-500">Used</span>
                    </>
                  ) : (
                    <>
                      <Gamepad2 className="h-4 w-4 mr-2" />
                      {completionPercentage >= milestone.percentage ? "Start Break" : "Locked"}
                    </>
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export type { GameMilestone }; 