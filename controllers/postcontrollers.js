const cloudinary = require("cloudinary");
const Posts = require("../model/postmodel");


const createPost = async (req, res) => {
    // step 1 : check incomming data
    console.log(req.body);
    console.log(req.files);

    // step 2 : Destructuring data
    const {
        postTitle,
        postDescription,
        postLocation,
    } = req.body;
    const { postImage } = req.files;

    // step 3 : Validate data
    if (!postTitle || !postDescription || !postImage || !postLocation) {
        return res.json({
            success: false,
            message: "Please fill all the fields"
        })
    }

    try {
        // upload image to cloudinary
        const uploadedImage = await cloudinary.v2.uploader.upload(
            postImage.path,
            {
                folder: "posts",
                crop: "scale"
            }
        )

        // Save to database
        const newPost = new Posts({
           postTitle:postTitle,
            postDescription: postDescription,
            postLocation: postLocation,
            postImageUrl: uploadedImage.secure_url
           
        })
        await newPost.save();
        res.json({
            success: true,
            message: "Post created successfully",
            post: newPost
        })



    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }

}


// get all posts
// const getPosts = async (req,res) => {
//     try {
//         const allPosts = await Posts.find({});
//         res.json({
//             success : true,
//             message : "All posts fetched successfully!",
//             posts : allPosts
//         })

//     } catch (error) {
//         console.log(error);
//         res.send("Internal server error")
//     }

// }

/// get all posts with pagination
const getAllPosts = async (req, res) => {

    try {
        // Extract page and limit from query parameters, default to page 1 and limit 10
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query._limit) || 3;

        const skip = (page - 1) * limit;



        // Calculate skip value based on the page and limit
        // const skip = (page - 1) * limit;

        // Fetch posts with pagination
        const posts = await Posts.find({}).skip(skip).limit(limit);

        res.status(200).json({
            success: true,
            message: "All posts fetched successfully.",
            count: posts.length,
            page: page,
            limit: limit,
            posts: posts,
        });
    } catch (error) {
        res.json({
            success: false,
            message: "Server Error",
            error: error,
        });
    }
};

// fetch single post
const getSinglePost = async (req, res) => {
    const postId = req.params.id;
    try {
        const singlePost = await Posts.findById(postId);
        res.json({
            success: true,
            message: "Single post fetched successfully!",
            post: singlePost
        })

    } catch (error) {
        console.log(error);
        res.send("Internal server error")
    }
}

// update post
const updatePost = async (req, res) => {
    // step 1 : check incomming data
    console.log(req.body);
    console.log(req.files);

    // destructuring data
    const {
       postTitle,
       postDescription,
        postLocation
    } = req.body;
    const { postImage } = req.files;

    // validate data
    if (!postTitle
        || !postDescription
        || !postLocation) {
        return res.json({
            success: false,
            message: "Required fields are missing!"
        })
    }

    try {
        // case 1 : if there is image
        if (postImage) {
            // upload image to cloudinary
            const uploadedImage = await cloudinary.v2.uploader.upload(
                postImage.path,
                {
                    folder: "posts",
                    crop: "scale"
                }
            )

            // make updated json data
            const updatedData = {
               postTitle:postTitle,
                postDescription: postDescription,
                postLocation: postLocation,
                postImageUrl: uploadedImage.secure_url
                
            }

            // find post and update
            const postId = req.params.id;
            await Posts.findByIdAndUpdate(postId, updatedData)
            res.json({
                success: true,
                message: "Post updated successfully with Image!",
                updatedPost: updatedData
            })

        } else {
            // update without image
            const updatedData = {
               postTitle:postTitle,
                postDescription: postDescription,
                postLocation: postLocation
                
            }

            // find post and update
            const postId = req.params.id;
            await Posts.findByIdAndUpdate(postId, updatedData)
            res.json({
                success: true,
                message: "Post updated successfully without Image!",
                updatedPost: updatedData
            })
        }

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}

// delete post
const deletePost = async (req, res) => {
    const postId = req.params.id;

    try {
        await Posts.findByIdAndDelete(postId);
        res.json({
            success: true,
            message: "Post deleted successfully!"
        })

    } catch (error) {
        res.json({
            success: false,
            message: "Server error!!"
        })
    }
}

const searchByPostTitle = async (req, res) => {

    try {
        const {postTitle } = req.body;
        console.log(postTitle)
        const items = await Posts.find({postTitle });
        res.status(200).json({ success: true,postTitles: items });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }


}

module.exports = {
    createPost,
    getAllPosts,
    getSinglePost,
    updatePost,
    deletePost,
    searchByPostTitle
}