import express from "express";
import { protect } from "../middlewares/authMiddleware";
import { createLink, getLinks,deleteLink } from "../controllers/linkController";
import ogs from "open-graph-scraper";
import { DEFAULT_THUMBNAIL } from "../constants/constant";
import { getFavicon } from "../utils/getFavicon";
import { getPlatformThumbnail } from "../utils/getPlantformThumbnail";
const router=express.Router();

router.get("/preview",async(req,res)=>{
    const {url}=req.query;
    if(!url) return res.status(400).json({message:"URL Required"});

    try{
        const {result}=await ogs({
            url:String(url),
            timeout:3000,
            onlyGetOpenGraphInfo:true,
        });
        
        console.log("URL FROM OG::",result.ogImage?.[0]?.url);
        let thumbnail = result.ogImage?.[0]?.url || getPlatformThumbnail(String(url)) || getFavicon(String(url)) || DEFAULT_THUMBNAIL;
        
        return res.json({
            title:result.ogTitle || "",
            thumbnail,
        });

    }catch(error){
        return res.json({
            title:"",
            thumbnail:getPlatformThumbnail(String(url)) || getFavicon(String(url)) || DEFAULT_THUMBNAIL,
            error:error
        })
    }
});
router.post("/create",protect,createLink);
router.get("/:workspaceId",protect,getLinks);
router.delete("/:id",protect,deleteLink)
//router.post("/move",protect,moveLinkToWorkspace);
export default router;