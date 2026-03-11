import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MoveRight, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

function AnimatedHero() {
  const [titleNumber, setTitleNumber] = useState(0);
  const titles = useMemo(
    () => ["data-driven", "AI-powered", "insightful", "comprehensive", "actionable"],
    []
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (titleNumber === titles.length - 1) {
        setTitleNumber(0);
      } else {
        setTitleNumber(titleNumber + 1);
      }
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [titleNumber, titles]);

  return (
    <div className="w-full min-h-screen bg-white">
      <div className="container mx-auto">
        <div className="flex gap-8 py-20 lg:py-40 items-center justify-center flex-col">
          <div>
            <Button variant="secondary" size="sm" className="gap-4">
              UAE Supply Chain & Logistics <BarChart3 className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex gap-4 flex-col">
            <h1 className="text-5xl md:text-7xl max-w-2xl tracking-tighter text-center font-regular">
              <span className="text-gray-900">Career analytics that are</span>
              <span className="relative flex w-full justify-center overflow-hidden text-center md:pb-4 md:pt-1">
                &nbsp;
                {titles.map((title, index) => (
                  <motion.span
                    key={index}
                    className="absolute font-semibold bg-gradient-to-r from-[#1976D2] to-[#45BFD3] bg-clip-text text-transparent"
                    initial={{ opacity: 0, y: "-100" }}
                    transition={{ type: "spring", stiffness: 50 }}
                    animate={
                      titleNumber === index
                        ? {
                            y: 0,
                            opacity: 1,
                          }
                        : {
                            y: titleNumber > index ? -150 : 150,
                            opacity: 0,
                          }
                    }
                  >
                    {title}
                  </motion.span>
                ))}
              </span>
            </h1>

            <p className="text-lg md:text-xl leading-relaxed tracking-tight text-gray-500 max-w-2xl text-center">
              Explore salary benchmarks, career domains, and certification
              pathways across 18 supply chain domains. Navigate your career in
              the UAE logistics industry with 30+ interactive visualizations.
            </p>
          </div>
          <div className="flex flex-row gap-3">
            <Link href="/domains">
              <Button size="lg" className="gap-4" variant="outline">
                Explore Domains <MoveRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/visualizations">
              <Button size="lg" className="gap-4">
                View Visualizations <BarChart3 className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export { AnimatedHero };
