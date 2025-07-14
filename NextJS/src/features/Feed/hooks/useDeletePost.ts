import { useMutation } from '@apollo/client';
import { POST_DELETE } from '../graphql';


export const usePostDelete = () => {
    const [removePost] = useMutation(POST_DELETE);
    const deletePost = async (postId: string) => {
        try {
            await removePost({
                variables: {
                    updatePostInput: {
                        _id: postId,
                        status: "DELETE"
                    }
                }
            });
        } catch (error) {
            console.error(error);
        }
    }




    return {
        deletePost
    }
}