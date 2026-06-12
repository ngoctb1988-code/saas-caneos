"use client";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { VND, compact, fmtShort } from "@/lib/format";
const AXIS=`hsl(var(--muted-foreground))`;const GRID=`hsl(var(--border))`;const PRI=`hsl(var(--primary))`;const RED=`hsl(var(--destructive))`;
function Tip({active,payload,label}:any){
  if(!active||!payload?.length)return null;
  return <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-md">
    <p className="mb-1 font-medium">{label}</p>
    {payload.map((p:any)=><p key={p.dataKey} className="tnum flex justify-between gap-4" style={{color:p.color}}><span>{p.name}</span><span className="font-medium">{VND(p.value)}</span></p>)}
  </div>;
}
const baseOpts=(grid:string,axis:string)=>({responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{content:<Tip/>}},scales:{x:{grid:{display:false},ticks:{color:axis,maxTicksLimit:8,font:{size:11}}},y:{grid:{color:grid},ticks:{color:axis,font:{size:11},callback:(v:number)=>compact(v)}}}});
export function RevenueTrend({data}:{data:{date:string;revenue:number;profit:number}[]}){
  return <ResponsiveContainer width="100%" height={240}>
    <AreaChart data={data} margin={{left:4,right:4,top:8,bottom:0}}>
      <defs>
        <linearGradient id="gR" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={PRI} stopOpacity={0.35}/><stop offset="100%" stopColor={PRI} stopOpacity={0}/>
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false}/>
      <XAxis dataKey="date" tickFormatter={fmtShort} tick={{fontSize:11,fill:AXIS}} tickLine={false} axisLine={false} minTickGap={24}/>
      <YAxis tickFormatter={compact} tick={{fontSize:11,fill:AXIS}} tickLine={false} axisLine={false} width={44}/>
      <Tooltip content={<Tip/>}/>
      <Area type="monotone" dataKey="revenue" name="Doanh thu" stroke={PRI} strokeWidth={2} fill="url(#gR)"/>
    </AreaChart>
  </ResponsiveContainer>;
}
export function CashflowBars({data}:{data:{date:string;inflow:number;outflow:number}[]}){
  return <ResponsiveContainer width="100%" height={240}>
    <BarChart data={data} margin={{left:4,right:4,top:8,bottom:0}}>
      <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false}/>
      <XAxis dataKey="date" tickFormatter={fmtShort} tick={{fontSize:11,fill:AXIS}} tickLine={false} axisLine={false} minTickGap={20}/>
      <YAxis tickFormatter={compact} tick={{fontSize:11,fill:AXIS}} tickLine={false} axisLine={false} width={44}/>
      <Tooltip content={<Tip/>}/>
      <Bar dataKey="inflow" name="Tiền vào" fill={PRI} radius={[4,4,0,0]} maxBarSize={32}/>
      <Bar dataKey="outflow" name="Tiền ra" fill={RED} fillOpacity={0.7} radius={[4,4,0,0]} maxBarSize={32}/>
    </BarChart>
  </ResponsiveContainer>;
}
