import { NextResponse } from "next/server";
import { DEFAULT_BAYAN_STUDIO_PROJECT } from "../../../../learn/arabic-b/lib/bayan-studio-defaults";
import type { BayanStudioProject } from "../../../../learn/arabic-b/lib/bayan-studio-schema";
import { readDraft, saveDraft } from "../../../../learn/arabic-b/lib/bayan-platform-repository";
export const runtime = "nodejs";
export async function GET(){ try { return NextResponse.json({ project: (await readDraft()) ?? DEFAULT_BAYAN_STUDIO_PROJECT }); } catch(e){ return NextResponse.json({error:e instanceof Error?e.message:"load failed"},{status:500}); } }
export async function PUT(r:Request){ try { const b=await r.json() as {project:BayanStudioProject}; if(!b.project) return NextResponse.json({error:"invalid"},{status:400}); await saveDraft(b.project); return NextResponse.json({ok:true}); } catch(e){ return NextResponse.json({error:e instanceof Error?e.message:"save failed"},{status:500}); } }
