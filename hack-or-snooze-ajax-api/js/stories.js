"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);
  const hostName = story.getHostName();
  const favorites = []

  if(currentUser){
    for(let i = 0; i < currentUser.favorites.length; i++){
      favorites.push(currentUser.favorites[i].storyId);
    }

    if(favorites.includes(story.storyId)){
      return $(`
      <li id="${story.storyId}">
        <i class="far fa-star selected" id="star"></i>
        <a href="${story.url}" target="a_blank" class="story-link">${story.title}</a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
        <small class="remove"><a href="#" id="delete">Delete</a></small>
      </li>
      `);
    }
  }
  
  return $(`
  <li id="${story.storyId}">
    <i class="far fa-star" id="star"></i>
    <a href="${story.url}" target="a_blank" class="story-link">${story.title}</a>
    <small class="story-hostname">(${hostName})</small>
    <small class="story-author">by ${story.author}</small>
    <small class="story-user">posted by ${story.username}</small>
    <small class="remove"><a href="#" id="delete">Delete</a></small>
  </li>
  `);
}

function generateFavoriteStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);
  const hostName = story.getHostName();
  const favorites = []

  for(let i = 0; i < currentUser.favorites.length; i++){
    favorites.push(currentUser.favorites[i].storyId);
  }

  if(favorites.includes(story.storyId)){
    return $(`
    <li id="${story.storyId}">
      <i class="far fa-star selected" id="star"></i>
      <a href="${story.url}" target="a_blank" class="story-link">
        ${story.title}
      </a>
      <small class="story-hostname">(${hostName})</small>
      <small class="story-author">by ${story.author}</small>
      <small class="story-user">posted by ${story.username}</small>
      <small class="remove"><a href="#" id="delete">Delete</a></small>
    </li>
    `);
  }
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

function putFavoriteStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateFavoriteStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

$addStoryForm.on("submit", function(e){
  e.preventDefault();
  appendStory();
});

async function appendStory(){
  let a = $("#author").val();
  let t = $("#title").val();
  let u = $("#url").val();
  
  let newStory = await storyList.addStory(currentUser,
    {title: `${a}`, author: `${t}`, url: `${u}`});
  const $story = generateStoryMarkup(newStory);
  $allStoriesList.prepend($story);

  $("#author").val("");
  $("#title").val("");
  $("#url").val("");
  $addStoryForm.hide();
}

$("ol").on("click", function(e){
  if(e.target.id == "star" && !e.target.classList.contains("selected")){ 
    addFavorite(e);
  }
  else if(e.target.id == "star" && e.target.classList.contains("selected")){
    deleteFavorite(e);
  }

  if(e.target.id == "delete" && currentUser){
    deleteStory(e);
  }
});

async function addFavorite(e){
  let li = e.target.parentElement;
  let star = li.querySelector("i");
  star.classList.add("selected");
  const token = currentUser.loginToken;

  await axios({
    url: `${BASE_URL}/users/${currentUser.username}/favorites/${li.id}`,
    method: "POST",
    data: { token }
  });
}

async function deleteFavorite(e){
  let li = e.target.parentElement;
  let star = li.querySelector("i");
  star.classList.remove("selected");
  const token = currentUser.loginToken;

  await axios({
    url: `${BASE_URL}/users/${currentUser.username}/favorites/${li.id}`,
    method: "DELETE",
    data: { token }
  });
}

async function deleteStory(e){
  const favorites = []
  const token = currentUser.loginToken;
  const li = e.target.parentElement.parentElement;
  
  for(let i = 0; i < currentUser.favorites.length; i++){
    favorites.push(currentUser.favorites[i].storyId);
  }

  if(favorites.includes(li.id)){
    await axios({
      url: `${BASE_URL}/users/${currentUser.username}/favorites/${li.id}`,
      method: "DELETE",
      data: { token }
    });
  }

  await axios({
    url: `${BASE_URL}/stories/${li.id}`,
    method: "DELETE",
    data: { token }
  });
  
  e.target.parentElement.parentElement.remove();
}
