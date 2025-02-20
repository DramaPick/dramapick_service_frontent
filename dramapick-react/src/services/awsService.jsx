import AWS from "aws-sdk";

const config = {
    aws_reg: process.env.REACT_APP_AWS_REG,
    aws_key: process.env.REACT_APP_AWS_KEY,
    aws_sec: process.env.REACT_APP_AWS_SEC,
    aws_bucket: process.env.REACT_APP_AWS_BUCKET
};

AWS.config.update({
    region: config.aws_reg,
    accessKeyId: config.aws_key,
    secretAccessKey: config.aws_sec,
});

const s3 = new AWS.S3({});

export const getVideo = async (shortsTitle) => {
    const encodedTitle = encodeURIComponent(shortsTitle);
    console.log("encodedTitle: ", encodedTitle);

    async function download(filename) {
        try {
            const data = await s3.getObject({
                    Key: `${encodedTitle}`,
                    Bucket: config.aws_bucket,  // 버킷 이름
                }).promise();

            const blob = new Blob([data.Body], { type: "video/mp4" });
            const urlCreator = window.URL || window.webkitURL;
            const videoUrl = urlCreator.createObjectURL(blob);

            return videoUrl;

        } catch (error) {
            console.error("Error fetching video:", error);
            return "";
        }
    }

    let data = await download(shortsTitle);
    return data;
};