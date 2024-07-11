const cloudinary = require("cloudinary");
const Journals = require("../model/journalModel");
const Users = require('../model/usermodel');
const mongoose = require('mongoose');


const createjournal = async (req, res) => {
    // step 1 : check incomming data
    console.log(req.body);
    console.log(req.files);

    // step 2 : Destructuring data
    const {
        journalName,
        journalDescription,
        journalLocation,
    } = req.body;
    const { journalImage } = req.files;

    // step 3 : Validate data
    if (!journalName || !journalDescription || !journalImage || !journalLocation) {
        return res.json({
            success: false,
            message: "Please fill all the fields"
        })
    }

    try {
        // upload image to cloudinary
        const uploadedImage = await cloudinary.v2.uploader.upload(
            journalImage.path,
            {
                folder: "Journals",
                crop: "scale"
            }
        )


        console.log("hello" + journalName, journalDescription, journalLocation)
        // Save to database
        const newjournal = new Journals({
            journalName: journalName,
            journalDescription: journalDescription,
            journalImageUrl: uploadedImage.secure_url,
            journalLocation: journalLocation,
            createdBy: req.user.id
        })
        await newjournal.save();
        res.json({
            success: true,
            message: "journal created successfully",
            journal: newjournal
        })



    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }

}
// Get journals posted by a specific user
const getUserJournals = async (req, res) => {
    const userId = req.params.userId;
    console.log(userId)

    try {
        const userJournals = await Journals.find({ createdBy: userId });
        if (userJournals.length === 0) {
            return res.status(404).json({ success: false, message: 'No journals found for this user' });
        }

        res.json({
            success: true,
            message: "User journals fetched successfully",
            journals: userJournals
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};


// get all Journals
const getAllJournals = async (req, res) => {
    try {
        const allJournals = await Journals.aggregate([
            {
                $lookup: {
                    from: 'users',
                    localField: 'createdBy',
                    foreignField: '_id',
                    as: 'userDetails',
                },
            },
            {
                $unwind: '$userDetails',
            },
            {
                $project: {
                    journalName: 1,
                    journalDescription: 1,
                    journalImageUrl: 1,
                    journalLocation: 1,
                    likes: 1,
                    savedBy: 1,
                    createdAt: 1,
                    'userDetails.username': 1,
                },
            },
        ]);
        // const allJournals = await Journals.find({});
        res.json({
            success: true,
            message: "All Journals fetched successfully!",
            Journals: allJournals
        })

    } catch (error) {
        console.log(error);
        res.send("Internal server error")
    }

}


// fetch single journal
// const getSinglejournal = async (req, res) => {
//     const journalId = req.params.id;
//     try {
//         const singlejournal = await Journals.findById(journalId);
//         res.json({
//             success: true,
//             message: "Single journal fetched successfully!",
//             journal: singlejournal
//         })

//     } catch (error) {
//         console.log(error);
//         res.send("Internal server error")
//     }
// }
const getSinglejournal = async (req, res) => {
    const journalId = req.params.id;
    try {
        const singleJournal = await Journals.aggregate([
            {
                $match: { _id: new mongoose.Types.ObjectId(journalId) }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'createdBy',
                    foreignField: '_id',
                    as: 'userDetails',
                },
            },
            {
                $unwind: '$userDetails',
            },
            {
                $project: {
                    journalName: 1,
                    journalDescription: 1,
                    journalImageUrl: 1,
                    journalLocation: 1,
                    likes: 1,
                    savedBy: 1,
                    createdAt: 1,
                    'userDetails.username': 1,
                },
            },
        ]);

        if (singleJournal.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Journal not found!",
            });
        }

        res.json({
            success: true,
            message: "Single journal fetched successfully!",
            journal: singleJournal[0]
        });

    } catch (error) {
        console.log(error);
        res.status(500).send("Internal server error");
    }
};


// update journal
const updatejournal = async (req, res) => {
    // step 1 : check incomming data
    console.log(req.body);
    console.log(req.files);

    // destructuring data
    const {
        journalName,
        journalDescription,
        journalLocation
    } = req.body;
    const { journalImage } = req.files;

    // validate data
    if (!journalName
        || !journalDescription
        || !journalLocation) {
        return res.json({
            success: false,
            message: "Required fields are missing!"
        })
    }

    try {
        // case 1 : if there is image
        if (journalImage) {
            // upload image to cloudinary
            const uploadedImage = await cloudinary.v2.uploader.upload(
                journalImage.path,
                {
                    folder: "Journals",
                    crop: "scale"
                }
            )

            // make updated json data
            const updatedData = {
                journalName: journalName,
                journalDescription: journalDescription,
                journalImageUrl: uploadedImage.secure_url,
                journalLocation: journalLocation
            }

            // find journal and update
            const journalId = req.params.id;
            await Journals.findByIdAndUpdate(journalId, updatedData)
            res.json({
                success: true,
                message: "journal updated successfully with Image!",
                updatedjournal: updatedData
            })

        } else {
            // update without image
            const updatedData = {
                journalName: journalName,
                journalDescription: journalDescription,
                journalLocation: journalLocation
            }

            // find journal and update
            const journalId = req.params.id;
            await Journals.findByIdAndUpdate(journalId, updatedData)
            res.json({
                success: true,
                message: "journal updated successfully without Image!",
                updatedjournal: updatedData
            })
        }

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}

// delete journal
const deletejournal = async (req, res) => {
    const journalId = req.params.id;

    try {
        await Journals.findByIdAndDelete(journalId);
        res.json({
            success: true,
            message: "journal deleted successfully!"
        })

    } catch (error) {
        res.json({
            success: false,
            message: "Server error!!"
        })
    }
}

const searchByjournalName = async (req, res) => {

    try {
        const { journalName } = req.body;
        console.log(journalName)
        const items = await Journals.find({ journalName });
        res.status(200).json({ success: true, journalNames: items });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }


}


// Like a journal
const likeJournal = async (req, res) => {
    const {journalId} = req.params.id;
    const userId = req.user.id;
    console.log("hello" + userId)
    try {
        const journal = await Journals.findById(journalId);
        if (!journal) {
            return res.status(404).json({ success: false, message: 'Journal not found' });
        }

        if (journal.likes.includes(userId)) {
            return res.status(400).json({ success: false, message: 'Already liked' });
        }

        journal.likes.push(userId);
        await journal.save();

        res.json({ success: true, message: 'Journal liked successfully' });
    } catch (error) {
        console.error("error is here" + error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Unlike a journal
const unlikeJournal = async (req, res) => {
    const journalId = req.params.id;
    const userId = req.user.id;

    try {
        const journal = await Journals.findById(journalId);
        if (!journal) {
            return res.status(404).json({ success: false, message: 'Journal not found' });
        }

        if (!journal.likes.includes(userId)) {
            return res.status(400).json({ success: false, message: 'Not liked yet' });
        }

        journal.likes = journal.likes.filter(id => id.toString() !== userId.toString());
        await journal.save();

        res.json({ success: true, message: 'Journal unliked successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Save a journal
const saveJournal = async (req, res) => {
    const journalId = req.params.id;
    const userId = req.user.id;

    try {
        const journal = await Journals.findById(journalId);
        if (!journal) {
            return res.status(404).json({ success: false, message: 'Journal not found' });
        }

        if (journal.savedBy.includes(userId)) {
            return res.status(400).json({ success: false, message: 'Already saved' });
        }

        journal.savedBy.push(userId);
        await journal.save();

        res.json({ success: true, message: 'Journal saved successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Unsaved a journal
const unsaveJournal = async (req, res) => {
    const journalId = req.params.id;
    const userId = req.user.id;

    try {
        const journal = await Journals.findById(journalId);
        if (!journal) {
            return res.status(404).json({ success: false, message: 'Journal not found' });
        }

        if (!journal.savedBy.includes(userId)) {
            return res.status(400).json({ success: false, message: 'Not saved yet' });
        }

        journal.savedBy = journal.savedBy.filter(id => id.toString() !== userId.toString());
        await journal.save();

        res.json({ success: true, message: 'Journal unsaved successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Get journals saved by the currently authenticated user
const getSavedJournals = async (req, res) => {
    const userId = req.user.id; // Get the current user's ID from the request
    // console.log(userId)
    try {
        // Find all journals where the `savedBy` array contains the user's ID
        const savedJournals = await Journals.find({ savedBy: userId });

        if (savedJournals.length === 0) {
            return res.status(404).json({ success: false, message: 'No saved journals found for this user' });
        }

        res.json({
            success: true,
            message: "Saved journals fetched successfully",
            journals: savedJournals
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};


module.exports = {
    createjournal,
    getUserJournals,
    getAllJournals,
    getSinglejournal,
    updatejournal,
    deletejournal,
    searchByjournalName,
    likeJournal,
    unlikeJournal,
    saveJournal,
    unsaveJournal,
    getSavedJournals
};
