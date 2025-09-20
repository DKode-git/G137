import { Link, useLocation } from "wouter";
import { Dumbbell, BarChart3, Apple, Trophy, Bell } from "lucide-react";

export default function Navigation() {
  const [location] = useLocation();

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: BarChart3 },
    { path: "/workouts", label: "Workouts", icon: Dumbbell },
    { path: "/nutrition", label: "Nutrition", icon: Apple },
    { path: "/progress", label: "Progress", icon: Trophy },
  ];

  return (
    <nav className="bg-card border-b border-border shadow-sm sticky top-0 z-50" data-testid="navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/" data-testid="link-home">
                <h1 className="text-2xl font-bold text-primary cursor-pointer">
                  <Dumbbell className="inline mr-2" />
                  FitTracker Pro
                </h1>
              </Link>
            </div>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navItems.map(({ path, label, icon: Icon }) => {
                const isActive = location === path || (location === "/" && path === "/dashboard");
                return (
                  <Link key={path} href={path} data-testid={`link-${label.toLowerCase()}`}>
                    <button
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {label}
                    </button>
                  </Link>
                );
              })}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="text-muted-foreground hover:text-foreground" data-testid="button-notifications">
              <Bell className="h-5 w-5" />
            </button>
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center" data-testid="avatar-user">
              <span className="text-primary-foreground text-sm font-medium">JD</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
