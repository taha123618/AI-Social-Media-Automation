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
      const action = searchParams.get("action") || undefined;
      const status = searchParams.get("status") || undefined;

      const data = await SystemService.getAuditLogs({
         page,
         limit,
         search,
         action,
         status,
      });

      return NextResponse.json(data);
   } catch (error) {
      console.error("Error fetching audit logs:", error);
      return NextResponse.json({ error: "Failed to fetch audit logs" }, { status: 500 });
   }
}
