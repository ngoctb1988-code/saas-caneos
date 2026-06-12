import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
interface Props{label:string;value:string;hint?:string;icon?:React.ReactNode;accent?:boolean;trend?:number;className?:string}
export function StatCard({label,value,hint,icon,accent,trend,className}:Props){
  return <Card className={cn("animate-fade-in p-5",accent&&"border-primary/30 bg-primary/[0.04]",className)}>
    <div className="flex items-start justify-between gap-2">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      {icon&&<span className="text-muted-foreground/70">{icon}</span>}
    </div>
    <p className="tnum mt-2 text-2xl font-semibold tracking-tight">{value}</p>
    {hint&&<p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    {trend!==undefined&&<p className={cn("mt-1 text-xs font-medium",trend>=0?"text-emerald-600":"text-destructive")}>
      {trend>=0?"↑":"↓"} {Math.abs(trend).toFixed(1)}% so tháng trước
    </p>}
  </Card>;
}
