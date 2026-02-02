"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const linkController_1 = require("../controllers/linkController");
const open_graph_scraper_1 = __importDefault(require("open-graph-scraper"));
const constant_1 = require("../constants/constant");
const getFavicon_1 = require("../utils/getFavicon");
const getPlantformThumbnail_1 = require("../utils/getPlantformThumbnail");
const router = express_1.default.Router();
router.get("/preview", async (req, res) => {
    const { url } = req.query;
    if (!url)
        return res.status(400).json({ message: "URL Required" });
    try {
        const { result } = await (0, open_graph_scraper_1.default)({
            url: String(url),
            timeout: 3000,
            onlyGetOpenGraphInfo: true,
        });
        let thumbnail = result.ogImage?.[0]?.url || (0, getPlantformThumbnail_1.getPlatformThumbnail)(String(url)) || (0, getFavicon_1.getFavicon)(String(url)) || constant_1.DEFAULT_THUMBNAIL;
        return res.json({
            title: result.ogTitle || "",
            thumbnail,
        });
    }
    catch (error) {
        return res.json({
            title: "",
            thumbnail: (0, getPlantformThumbnail_1.getPlatformThumbnail)(String(url)) || (0, getFavicon_1.getFavicon)(String(url)) || constant_1.DEFAULT_THUMBNAIL,
            error: error
        });
    }
});
router.post("/create", authMiddleware_1.protect, linkController_1.createLink);
router.get("/:workspaceId", authMiddleware_1.protect, linkController_1.getLinks);
router.delete("/:id", authMiddleware_1.protect, linkController_1.deleteLink);
//router.post("/move",protect,moveLinkToWorkspace);
exports.default = router;
