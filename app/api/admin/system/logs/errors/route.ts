
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
      const source = searchParams.get("source") || undefined;
      const resolvedParam = searchParams.get("resolved");

      let resolved: boolean | undefined = undefined;
      if (resolvedParam === "true") resolved = true;
      if (resolvedParam === "false") resolved = false;

      const data = await SystemService.getErrorLogs({
         page,
         limit,
         search,
         source,
         resolved,
      });

      return NextResponse.json(data);
   } catch (error) {
      console.error("Error fetching error logs:", error);
      return NextResponse.json({ error: "Failed to fetch error logs" }, { status: 500 });
   }
}
