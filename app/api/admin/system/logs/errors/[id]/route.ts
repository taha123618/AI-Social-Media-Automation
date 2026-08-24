import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";
import { SystemLogger } from "@/features/system/services/logger.service";

export async function PUT(
   req: NextRequest,
   { params }: { params: Promise<{ id: string }> }
) {
   const { id } = await params;
   try {
      const session = await getAdminSession();
      if (!session) {
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

     const { resolved } = await req.json();

     const updatedLog = await prisma.errorLog.update({
        where: { id },
        data: { resolved },
     });

     // Log the admin action
     await SystemLogger.logAudit({
        action: "RESOLVE_ERROR_LOG",
        resource: "ErrorLog",
        status: "SUCCESS",
        userId: session.id, // The admin's ID
        details: { errorLogId: id, resolved },
     });

     return NextResponse.json(updatedLog);
  } catch (error: any) {
     console.error("Failed to update error log:", error);
     await SystemLogger.logError({
        message: error.message || "Failed to update error log",
        source: "Admin.ErrorLog.PUT",
        context: { errorLogId: id }
     });
     return NextResponse.json(
        { error: "Failed to update error log" },
        { status: 500 }
     );
  }
}

export async function DELETE(
   req: NextRequest,
   { params }: { params: Promise<{ id: string }> }
) {
   const { id } = await params;
   try {
      const session = await getAdminSession();
      if (!session) {
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

     await prisma.errorLog.delete({
        where: { id },
     });

     // Log the admin action
     await SystemLogger.logAudit({
        action: "DELETE_ERROR_LOG",
        resource: "ErrorLog",
        status: "SUCCESS",
        userId: session.id,
        details: { errorLogId: id },
     });

     return NextResponse.json({ success: true });
  } catch (error: any) {
     console.error("Failed to delete error log:", error);
     await SystemLogger.logError({
        message: error.message || "Failed to delete error log",
        source: "Admin.ErrorLog.DELETE",
        context: { errorLogId: id }
     });
     return NextResponse.json(
        { error: "Failed to delete error log" },
        { status: 500 }
     );
  }
}
