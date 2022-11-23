function clearEditView(postId){
    //remove textarea,save and cancel button
    document.getElementById(`textarea_${postId}`).remove()
    document.getElementById(`save_${postId}`).remove()
    document.getElementById(`cancel_${postId}`).remove()

    //show content,edit and like
    document.getElementById(`post_content_${postId}`).style.display = 'block';
    document.getElementById(`edit_${postId}`).style.display = 'inline-block';
    document.getElementById(`post_likes_${postId}`).style.display = 'block';
}
// add validation message within parentDiv
function addValidationMessage(message, parentDiv) {
    //add validation message
    const warningMessage = document.createElement('p');
    warningMessage.innerHTML = message;
    warningMessage.className = 'text-danger';

    //add validation message to DOM
    document.getElementById(parentDiv).append(warningMessage);
}

//update no of likes for given id
function updateLikes(id, likes){
    let likeCount = document.getElementById(`post_likecount_${id}`);

    likeCount.innerHTML = likes;
}

document.addEventListener('DOMContentLoaded', function(){
    //add event listener that listen for any click on the page
    document.addEventListener('click', event => {

        //save the element the user clicked on 
        const element = event.target;

        //if the user click on a like icon
        if (element.id.startsWith('post_likeicon_')){
            
            //save post id from data in element
            let id = element.dataset.id;

            //make fetch request to update without full reload
            fetch(`/updatelike/${id}`, {
                method : 'POST'
            })
            .then(function(response){
                if (response.ok) {
                    return response.json()
                }
                //if response receives an error,reject the promise
                else {
                    return Promise.reject('There has been an error. ')
                }
            }).then(function(data){
            
                //save data form response
                const likes = data.likesCount;
                const likesPost = data.likesPost;

                //like icon on page
                let likeIcon = document.getElementById(`post_likeicon_${id}`);

                //update no of likes on page
                updateLikes(id, likes)

                //update like icon correctly according to whether user like post or not
                if (likesPost) {
                    likeIcon.className = 'likeicon fa-heart fas';
                }else {
                    likeIcon.className = 'likeicon fa-heart far';
                }
            }).catch(function(ex) {
            
                console.log('parsing failed', ex);
            });
        }
        //if the user clicked edit button
        if (element.id.startsWith('edit_')) {

            //save necessary variables
            const editButton = element;
            const postId = editButton.dataset.id;
            const postText = document.getElementById(`post_content_${postId}`);
        
            // Adding prepopulated text area element
            let textArea = document.createElement('textarea');
            textArea.innerHTML = postText.innerHTML;
            textArea.id = `textarea_${postId}`;
            textArea.className = 'form-control';
            document.getElementById(`post_contentgroup_${ postId }`).append(textArea);

            //Hiding original content
            postText.style.display = 'none';

            //Hiding like 
            document.getElementById(`post_likes_${postId}`).style.display = 'none';

            //Remove edit button
            editButton.style.display = 'none';

            //Add cancel button
            const cancelButton = document.createElement('button');
            cancelButton.innerHTML = 'Cancel';
            cancelButton.className = 'btn btn-outline-danger cancel-badge badge ml-1 text-right btn-sm';
            cancelButton.id = `cancel_${postId}`

            //Add save button
            const saveButton = document.createElement('button');
            saveButton.innerHTML = 'Save';
            saveButton.className = 'btn green-button btn-sm mt-2 px-2';
            saveButton.id = `save_${postId}`

            //Add savebutton to DOM
            document.getElementById(`save_buttons_${postId}`).append(saveButton);

            //Event listener click new cancel button
            cancelButton.addEventListener('click', function(){
                clearEditView(postId)
            })

            //Add cancel button to DOM
            document.getElementById(`post_headline_${postId}`).append(cancelButton)

            //Fetch request when the user click save button
            saveButton.addEventListener('click', function(){
                textArea = document.getElementById(`textarea_${postId}`);

                //Make fetch request to update page without full reload
                fetch(`/editpost/${postId}`, {
                    method: "POST",
                    body : JSON.stringify({
                        //pass through the new content typed in textarea 
                        content : textArea.value,
                    })
                })
            
                .then(response => {
                    if(response.ok || response.status == 400) {
                        return response.json()
                        //Throws error for user wht don't permission  
                    } else if(response.status === 404) {
                        clearEditView(postId)

                        //hiding button to prevent happing again
                        editButton.style.display = 'none';

                        //creat validation message
                        addValidationMessage('You are not authorised to do this', `post_contentgroup_${postId}`)

                        //reject promise and thorws error
                        return Promise.reject('Error 404')

                    } else {
                        return Promise.reject('There has been an error: ' + response.status)
                    }
                })

                .then(result => {
                    //If successful, load user's sent inbox
                    if (!result.error) {

                        //set on screen text to what the user edit
                        postText.innerHTML = result.content;

                        //restore to normal view
                        clearEditView(postId)

                    
                    }
                    else {
                        clearEditView(postId)

                        //hiding edit button
                        editButton.style.display = 'none';

                        //Add validation message
                        addValidationMessage(result.error, `post_contentgroup_${postId}`)
                    }
                })
                
                .catch(error => {
                    console.error(error);
                })
                
            })




        }
     })
            
 })


