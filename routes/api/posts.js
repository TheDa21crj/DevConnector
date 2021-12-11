const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const auth = require("../../middleware/auth");
const Post = require("../../models/Post");
const User = require("../../models/User");
const Profile = require("../../models/Profile");

//Create a post || private || api/posts
router.post(
    "/", [auth, [check("text", "text is required").not().isEmpty()]],
    async(req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors });
        }

        try {
            const user = await User.findById(req.user.id).select("-password");
            const newPost = new Post({
                text: req.body.text,
                name: user.name,
                avatar: user.avatar,
                user: req.user.id,
            });
            const post = await newPost.save();
            res.json(post);
        } catch (error) {
            res.status(500).send(error);
        }
    }
);

// Get all post || private || api/posts
router.get("/", auth, async(req, res) => {
    try {
        const post = await Post.find().sort({ date: -1 });
        res.json(post);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Get all post by ID || private || api/posts/:id
router.get("/:id", auth, async(req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: "NO post found" });
        }
        res.json(post);
    } catch (error) {
        if (error.kind == "ObjectId") {
            return res.status(404).json({ message: "NO post found" });
        }
        res.status(500).send(error);
    }
});

// Delete the post || private || api/posts/:id
router.delete("/:id", auth, async(req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: "NO post found" });
        }

        if (post.user.toString() !== req.user.id) {
            return res.status(401).json({ message: "User Not Authorized" });
        }

        await post.remove();

        res.json({ message: "Post Removed" });
    } catch (error) {
        if (error.kind == "ObjectId") {
            return res.status(404).json({ message: "NO post found" });
        }
        res.status(500).send(error);
    }
});

// Like a post || private || api/posts/like/:id
router.put("/like/:id", auth, async(req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (
            post.likes.filter((like) => like.user.toString() === req.user.id).length >
            0
        ) {
            return res.status(400).json({ message: "Post already liked" });
        }
        post.likes.unshift({ user: req.user.id });

        await post.save();

        res.json(post.likes);
    } catch (error) {
        res.status(500).send("Server error");
    }
});

// UnLike a post || private || api/posts/unlike/:id
router.put("/unlike/:id", auth, async(req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (
            post.likes.filter((like) => like.user.toString() === req.user.id)
            .length === 0
        ) {
            return res.status(400).json({ message: "Post has not Liked" });
        }

        const removeIdx = post.likes
            .map((like) => like.user.toString())
            .indexOf(req.user.id);

        post.likes.splice(removeIdx, 1);

        await post.save();

        res.json(post.likes);
    } catch (error) {
        console.error(error);
        res.status(500).send("Server error");
    }
});

// Comment on a post|| private || api/post/comment/:id
router.post(
    "/comment/:id", [auth, [check("text", "text is required").not().isEmpty()]],
    async(req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors });
        }

        try {
            const user = await User.findById(req.user.id).select("-password");
            const post = await Post.findById(req.params.id);

            const newComment = {
                text: req.body.text,
                name: user.name,
                avatar: user.avatar,
                user: req.user.id,
            };

            post.comments.unshift(newComment);
            await post.save();

            res.json(post.comments);
        } catch (error) {
            res.status(500).send(error);
        }
    }
);

// delete Comment || private || api/post/comment/:id/:comment_id
router.delete("/comment/:id/:comment_id", auth, async(req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        const comment = post.comments.find(
            (comment) => comment.id === req.params.comment_id
        );

        if (!comment) {
            return res.status(404).json({ message: "Comment Does not exist" });
        }
        if (comment.user.toString() !== req.user.id) {
            return res.status(401).json({ message: "User is not Authorized" });
        }

        const removeIdx = post.comments
            .map((comment) => comment.user.toString())
            .indexOf(req.user.id);

        post.comments.splice(removeIdx, 1);

        await post.save();

        res.json(post.comments);
    } catch (error) {
        res.status(500).send(error);
    }
});

module.exports = router;