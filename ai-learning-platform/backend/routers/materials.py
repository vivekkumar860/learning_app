import uuid
from fastapi import APIRouter, Depends, UploadFile, File, BackgroundTasks, Form
from models.material import MaterialOut, MaterialCreate
from models.user import Role, TokenData
from services.supabase_client import get_supabase
from services.storage import upload_material
from services.ingestion import ingest_material, ingest_raw_text
from utils.auth_helpers import get_current_user, require_role
from utils.validators import validate_file_extension

router = APIRouter()


@router.get("/{module_id}", response_model=list[MaterialOut])
async def list_materials(module_id: str, _: TokenData = Depends(get_current_user)):
    sb = get_supabase()
    result = sb.table("materials").select("*").eq("module_id", module_id).execute()
    return result.data


@router.post("/upload")
async def upload(
    background_tasks: BackgroundTasks,
    module_id: str = Form(...),
    title: str = Form(...),
    file: UploadFile = File(...),
    current_user: TokenData = Depends(require_role(Role.teacher, Role.admin)),
):
    file_ext = validate_file_extension(file.filename)
    course_id = await _get_course_id_for_module(module_id)
    upload_result = await upload_material(file, course_id)

    sb = get_supabase()
    mat = sb.table("materials").insert({
        "id": str(uuid.uuid4()),
        "title": title,
        "material_type": file_ext,
        "module_id": module_id,
        "storage_path": upload_result["storage_path"],
        "storage_url": upload_result["storage_url"],
        "status": "pending",
        "uploaded_by": current_user.user_id,
    }).execute().data[0]

    content = await file.read() if file.size else b""
    background_tasks.add_task(ingest_material, mat["id"], mat["storage_path"], content, file_ext)

    return {"material_id": mat["id"], "status": "processing"}


@router.post("/text")
async def upload_text(
    body: MaterialCreate,
    background_tasks: BackgroundTasks,
    current_user: TokenData = Depends(require_role(Role.teacher, Role.admin)),
):
    sb = get_supabase()
    mat = sb.table("materials").insert({
        "id": str(uuid.uuid4()),
        **body.model_dump(),
        "status": "pending",
        "uploaded_by": current_user.user_id,
    }).execute().data[0]
    if body.raw_text:
        background_tasks.add_task(ingest_raw_text, mat["id"], body.raw_text)
    return mat


@router.delete("/{material_id}")
async def delete_material(
    material_id: str,
    current_user: TokenData = Depends(require_role(Role.teacher, Role.admin)),
):
    sb = get_supabase()
    mat = sb.table("materials").select("storage_path").eq("id", material_id).execute().data
    if mat and mat[0].get("storage_path"):
        from services.storage import delete_material as del_file
        del_file(mat[0]["storage_path"])
    sb.table("materials").delete().eq("id", material_id).execute()
    return {"deleted": True}


async def _get_course_id_for_module(module_id: str) -> str:
    sb = get_supabase()
    result = sb.table("modules").select("course_id").eq("id", module_id).execute()
    return result.data[0]["course_id"]
