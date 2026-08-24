import { NextRequest, NextResponse } from "next/server";
import { SystemService } from "@/features/system/services/system.service";
import { getAdminSession } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
   try {
      const session = await getAdminSession();
      if (!session) {
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const searchParams = req.nextUrl.searchParams;
      const timeframe = (searchParams.get("timeframe") as "1h" | "24h" | "7d" | "30d") || "24h";

      const data = await SystemService.getMetrics({ timeframe });

      return NextResponse.json({ metrics: data });
   } catch (error) {
      console.error("Error fetching metrics:", error);
      return NextResponse.json({ error: "Failed to fetch metrics" }, { status: 500 });
   }
}
