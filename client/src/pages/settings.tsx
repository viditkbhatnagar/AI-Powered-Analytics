import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Moon,
  Sun,
  Palette,
  BarChart3,
  Check,
  Monitor,
} from "lucide-react";
import { useTheme } from "@/lib/theme-provider";
import { useToast } from "@/hooks/use-toast";

const colorSchemes = [
  {
    id: "blue",
    name: "Professional Blue",
    primary: "#3B82F6",
    description: "Clean, corporate look",
  },
  {
    id: "teal",
    name: "Ocean Teal",
    primary: "#14B8A6",
    description: "Fresh, modern feel",
  },
  {
    id: "purple",
    name: "Royal Purple",
    primary: "#A855F7",
    description: "Bold, creative style",
  },
];

export default function SettingsPage() {
  const { theme, colorScheme, setTheme, setColorScheme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const [chartAnimations, setChartAnimations] = useState(true);

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-muted-foreground">
          Customize your AI-Powered Analytics experience
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {theme === "dark" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              Appearance
            </CardTitle>
            <CardDescription>
              Choose your preferred theme and appearance settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label>Theme</Label>
              <div className="grid grid-cols-3 gap-3">
                <Button
                  variant={theme === "light" ? "default" : "outline"}
                  className="flex flex-col gap-2 h-auto py-4"
                  onClick={() => setTheme("light")}
                  data-testid="button-theme-light"
                >
                  <Sun className="h-5 w-5" />
                  <span className="text-xs">Light</span>
                </Button>
                <Button
                  variant={theme === "dark" ? "default" : "outline"}
                  className="flex flex-col gap-2 h-auto py-4"
                  onClick={() => setTheme("dark")}
                  data-testid="button-theme-dark"
                >
                  <Moon className="h-5 w-5" />
                  <span className="text-xs">Dark</span>
                </Button>
                <Button
                  variant="outline"
                  className="flex flex-col gap-2 h-auto py-4"
                  disabled
                >
                  <Monitor className="h-5 w-5" />
                  <span className="text-xs">System</span>
                </Button>
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Quick Toggle</Label>
                <p className="text-sm text-muted-foreground">
                  Switch between light and dark mode
                </p>
              </div>
              <Switch
                checked={theme === "dark"}
                onCheckedChange={toggleTheme}
                data-testid="switch-theme-toggle"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Color Scheme
            </CardTitle>
            <CardDescription>
              Select a color scheme for the application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={colorScheme}
              onValueChange={(value) => setColorScheme(value as "blue" | "teal" | "purple")}
              className="space-y-3"
            >
              {colorSchemes.map((scheme) => (
                <div
                  key={scheme.id}
                  className={`flex items-center gap-4 rounded-lg border p-4 cursor-pointer transition-colors ${
                    colorScheme === scheme.id ? "border-primary bg-primary/5" : "hover:border-muted-foreground/50"
                  }`}
                  onClick={() => setColorScheme(scheme.id as "blue" | "teal" | "purple")}
                  data-testid={`color-scheme-${scheme.id}`}
                >
                  <RadioGroupItem value={scheme.id} id={scheme.id} />
                  <div
                    className="h-10 w-10 rounded-lg"
                    style={{ backgroundColor: scheme.primary }}
                  />
                  <div className="flex-1">
                    <Label htmlFor={scheme.id} className="cursor-pointer font-medium">
                      {scheme.name}
                    </Label>
                    <p className="text-sm text-muted-foreground">{scheme.description}</p>
                  </div>
                  {colorScheme === scheme.id && (
                    <Check className="h-5 w-5 text-primary" />
                  )}
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Chart Preferences
            </CardTitle>
            <CardDescription>
              Customize how charts are displayed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Chart Animations</Label>
                <p className="text-sm text-muted-foreground">
                  Enable smooth transitions and animations
                </p>
              </div>
              <Switch
                checked={chartAnimations}
                onCheckedChange={setChartAnimations}
                data-testid="switch-animations"
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Show Tooltips</Label>
                <p className="text-sm text-muted-foreground">
                  Display data values on hover
                </p>
              </div>
              <Switch defaultChecked data-testid="switch-tooltips" />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Show Grid Lines</Label>
                <p className="text-sm text-muted-foreground">
                  Display grid lines on charts
                </p>
              </div>
              <Switch defaultChecked data-testid="switch-gridlines" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>About AI-Powered Analytics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Version</span>
            <span className="font-mono text-sm">1.0.0</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Region</span>
            <span>UAE (Pilot)</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Industry</span>
            <span>Supply Chain & Logistics</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Pre-loaded Data</span>
            <span>CO1-CO4 Complete</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
