const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const auth = require("../../middleware/auth");
const Profile = require("../../models/Profile");
const User = require("../../models/User");
const { check, validationResult } = require("express-validator");

router.get("/me", auth, async(req, res) => {
    try {
        // res.send("hello");
        const profile = await Profile.findOne({ user: req.user.id }).populate(
            "user", ["name", "avatar"]
        );
        if (!profile) {
            return res.status(400).json({ message: "No user" });
        }
    } catch (error) {
        console.log(error);
    }
});

router.post(
    "/", [
        auth,
        check("status", "status is required").not().isEmpty(),
        check("skills", "skills is required").not().isEmpty(),
    ],
    async(req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors });
        }

        const {
            company,
            website,
            location,
            bio,
            status,
            gitUserName,
            skills,
            youtube,
            facebook,
            twitter,
            instagram,
            linkedin,
        } = req.body;

        const profileFeilds = {};
        profileFeilds.user = req.user.id;
        if (company) {
            profileFeilds.company = company;
        }
        if (website) {
            profileFeilds.website = website;
        }
        if (location) {
            profileFeilds.location = location;
        }
        if (status) {
            profileFeilds.status = status;
        }
        if (bio) {
            profileFeilds.bio = bio;
        }
        if (gitUserName) {
            profileFeilds.gitUserName = gitUserName;
        }
        if (skills) {
            profileFeilds.skills = skills.split(",").map((skill) => skill.trim());
        }

        profileFeilds.social = {};

        if (youtube) {
            profileFeilds.social.youtube = youtube;
        }
        if (facebook) {
            profileFeilds.social.facebook = facebook;
        }
        if (twitter) {
            profileFeilds.social.twitter = twitter;
        }
        if (instagram) {
            profileFeilds.social.instagram = instagram;
        }
        if (linkedin) {
            profileFeilds.social.linkedin = linkedin;
        }

        try {
            let profile = await Profile.findOne({ user: req.user.id });
            if (profile) {
                profile = await Profile.findOneAndUpdate({ user: req.user.id }, { $set: profileFeilds }, { new: true });
                return res.json(profile);
            }

            profile = new Profile(profileFeilds);
            await profile.save();
            res.json(profile);
        } catch (error) {
            console.log(error);
        }
    }
);

router.get("/", async(req, res) => {
    try {
        const profiles = await Profile.find().populate("user", ["name", "avatar"]);
        res.json(profiles);
    } catch (error) {
        console.log(error);
    }
});

router.get("/user/:user_id", async(req, res) => {
    try {
        const profile = await Profile.findOne({
            user: req.params.user_id,
        }).populate("user", ["name", "avatar"]);

        if (!profile) {
            return res.status(400).json({ message: "No profile found" });
        }
        res.json(profile);
    } catch (error) {
        if (error.kind == "ObjectID") {
            return res.status(400).json({ message: "No profile found" });
        }
        console.log(error);
        res.status(500).send("server error");
    }
});

// Delete profile || private || api/profile
router.delete("/", auth, async(req, res) => {
    try {
        await Profile.findOneAndRemove({ user: req.user.id });
        await User.findOneAndRemove({ _id: req.user.id });

        res.json({ message: "User deleted successfully" });
    } catch (error) {
        console.log(error);
    }
});

// Add proifle experience || private || api/profile/experience
router.put(
    "/experience", [
        auth, [
            check("title", "title is required").not().isEmpty(),
            check("company", "company is required").not().isEmpty(),
            check("from", "from date is required").not().isEmpty(),
        ],
    ],
    async(req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errors.array() });
        }
        const { title, company, location, from, to, current, description } =
        req.body;

        const newExp = { title, company, location, from, to, current, description };

        try {
            const profile = await Profile.findOne({ user: req.user.id });
            profile.experience.unshift(newExp);

            await profile.save();

            res.json(profile);
        } catch (error) {
            console.log(error);
            res.status(500).send({ message: error.message });
        }
    }
);

// Delete Experience || private || api/profile/experience/:exp_id
router.delete("/experience/:exp_id", auth, async(req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id });
        const removeIdx = profile.experience
            .map((item) => item.id)
            .indexOf(req.params.exp_id);

        profile.experience.splice(removeIdx, 1);

        await profile.save();
        res.json(profile);
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: error.message });
    }
});

// Add proifle education || private || api/profile/education
router.put(
    "/education", [
        auth, [
            check("school", "school is required").not().isEmpty(),
            check("degree", "degree is required").not().isEmpty(),
            check("fieldofstudy", "fieldofstudy is required").not().isEmpty(),
            check("from", "from date is required").not().isEmpty(),
        ],
    ],
    async(req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errors.array() });
        }
        const { school, degree, fieldofstudy, from, to, current, description } =
        req.body;

        const newEdu = {
            school,
            degree,
            fieldofstudy,
            from,
            to,
            current,
            description,
        };

        try {
            const profile = await Profile.findOne({ user: req.user.id });
            profile.education.unshift(newEdu);

            await profile.save();

            res.json(profile);
        } catch (error) {
            console.log(error);
            res.status(500).send({ message: error.message });
        }
    }
);

// Delete education || private || api/profile/education/:exp_id
router.delete("/education/:edu_id", auth, async(req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id });
        const removeIdx = profile.education
            .map((item) => item.id)
            .indexOf(req.params.edu_id);

        profile.education.splice(removeIdx, 1);

        await profile.save();
        res.json(profile);
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: error.message });
    }
});

module.exports = router;