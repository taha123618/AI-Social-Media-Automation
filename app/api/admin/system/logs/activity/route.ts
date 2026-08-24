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
      const page = parseInt(searchParams.get("page") || "1", 10);
      const limit = parseInt(searchParams.get("limit") || "50", 10);
      const search = searchParams.get("search") || undefined;
      const entity = searchParams.get("entity") || undefined;
      const userId = searchParams.get("userId") || undefined;

      const data = await SystemService.getActivityLogs({
         page,
         limit,
         search,
         entity,
         userId,
      });

      return NextResponse.json(data);
   } catch (error) {
      console.error("Error fetching activity logs:", error);
      return NextResponse.json({ error: "Failed to fetch activity logs" }, { status: 500 });
   }
}
