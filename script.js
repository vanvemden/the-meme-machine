window.addEventListener("load", function() {

   // start the meme machine
   (function() {
      // set (default) theme
      setThemeTo(loadThemeFromStorage());
      // post saved memes
      postMemes(loadMemesFromStorage());
      // set user input events
      setThemeBarListener();
      setMemeFormListeners();
      setMemePostListeners();
   })();

   function setThemeBarListener() {
      let themeToggle = getThemeBarElement();
      themeToggle.addEventListener("click", function() {
         let label = getThemeLabelElement();
         if (label.innerText.toLowerCase() === "light") {
            setThemeTo("light");
            saveThemeToStorage("light");
         } else {
            setThemeTo("dark");
            saveThemeToStorage("dark");
         }
      });
   }

   function setMemeFormListeners() {
      ({ id, url, upperText, lowerText, buttonPost, buttonRandom, buttonClear } = getMemeFormElements())

      url.addEventListener("change", function() {
         postMemePreview();
      });

      upperText.addEventListener("keyup", function() {
         postMemePreview();
      });
      
      lowerText.addEventListener("keyup", function() {
         postMemePreview();
      });
      
      buttonPost.addEventListener("click", function(event) {
         event.preventDefault();
         let meme = getMemeFormInput();
         if (isValidURL(meme.url)) {
            if (meme.id == 0) {
               meme.id = new Date().valueOf();
            }
            addOrUpdateMeme(meme);
            clearPreviewElement();
            clearMemeFormInput();
         } else {
            alert("Please enter a valid image URL.");
         }
      });
      
      buttonRandom.addEventListener("click", function(event) {
         event.preventDefault();
         postPreviewLoading();
         fetchImageUrl().then( function(imageUrl) {
            let inputUrl = getMemeFormElementUrl();
            inputUrl.value = imageUrl.url;
            postMemePreview();
        }).catch( function(error) {
            alert("Oops! Error loading random image.");
        });
      });
      
      buttonClear.addEventListener("click", function(event) {
         event.preventDefault();
         clearPreviewElement();
         clearMemeFormInput();
      });
   }

   function setMemePostListeners() {
      let container = getMemeContainerElement();
      container.addEventListener("click", function(event) {
         switch(event.target.name) {
            case "delete":
               deleteMeme(event.target.dataset.id);
               break;
            case "edit":
               editMeme(event.target.dataset.id);
               document.getElementById("form").scrollIntoView();
               break;
         }
      });
   }

   async function fetchImageUrl() {
      let imageGeneratorUrls = [
         "https://loremflickr.com/450/450", 
         "https://picsum.photos/450/450",
         "https://source.unsplash.com/random/450x450",
         "https://unsplash.it/450/450"
      ];
      let index = Math.floor(Math.random() * imageGeneratorUrls.length);
      let imagePromise = fetch(imageGeneratorUrls[index]).then(function(response) {
              return response;
          }).catch( function(error) {
              return error;
          });
      return await imagePromise;
  }

   function addOrUpdateMeme(meme) {
      let memes = loadMemesFromStorage();
      for (let index = 0; index < memes.length; index++) {
         if (memes[index].id === meme.id ) {
            // update meme
            memes[index] = meme;
            saveMemesToStorage(memes);
            postMeme(meme, index);
            return;
         }
      }
      // add meme
      memes.unshift(meme);
      saveMemesToStorage(memes);
      postMeme(meme);
   }

   function postMeme(meme, index = undefined) {
      let element = formatMemePost(meme);
      let container = getMemeContainerElement();
      if (index === undefined) {
         container.insertBefore(element, container.firstChild);
      } else {
         var postedElement = container.children[index];
         container.replaceChild(element, postedElement);
      }
   }

   function getMemeById(id) {
      let memes = loadMemesFromStorage();
      for (let index = 0; index < memes.length; index++) {
         if (memes[index].id === parseInt(id)) {
            return memes[index];
         }
      }
      return {};
   }

   function editMeme(id) {
      let meme = getMemeById(id);
      setMemeFormInput(meme);
      postMemePreview(meme);
   }
   
   function deleteMeme(id) {
      if (confirm("Are you sure your want to delete this meme?")) {
         let memes = loadMemesFromStorage();
         for (let index = 0; index < memes.length; index++) {
            if (memes[index].id === parseInt(id)) {
               memes.splice(index, 1);
               break;
            }
         }
         clearMemesElement();
         saveMemesToStorage(memes);
         postMemes(memes);
      }
   }

   function postMemePreview() {
      let container = getPreviewElement();
      let meme = getMemeFormInput();
      container.innerHTML = "";
      if (isValidURL(meme.url)) {
         let element = formatMemePost(meme);
         container.appendChild(element);
      }
   }

   function postPreviewLoading() {
      let container = getPreviewElement();
      let meme = getMemeFormInput();
      container.innerHTML = "";
      meme.url = "img/loading.gif";
      let element = formatMemePost(meme);
      container.appendChild(element);
   }

   function clearPreviewElement() {
      let container = getPreviewElement();
      container.innerHTML = "";
   }

   function postMemes(memes) {
      for (let i = memes.length - 1; i >= 0; i--) {
         postMeme(memes[i]);
      }
   }

   function clearMemesElement() {
      let container = getMemeContainerElement();
      container.innerHTML = "";
   }
   
   function saveMemesToStorage(memes) {
      let str = JSON.stringify(memes);
      localStorage.setItem("meme-generator-memes", str);
   }

   function loadMemesFromStorage() {
      let str = localStorage.getItem("meme-generator-memes");
      return JSON.parse(str) || [];
   }

   function saveThemeToStorage(theme) {
      localStorage.setItem("meme-generator-theme", theme);
   }

   function loadThemeFromStorage() {
      let theme = localStorage.getItem("meme-generator-theme");
      return theme || "light";
   }

   function formatMemePost(meme) {
      ({ container, image, divUpper, divLower, remove, edit } = createMemePostElements());

      container.classList.add("meme");
      container.setAttribute("id", meme.id);
      image.src = meme.url;
      divUpper.innerText = meme.upperText;
      divUpper.classList.add("upper", "text");
      divLower.innerText = meme.lowerText;
      divLower.classList.add("lower", "text");

      if (meme.id > 0) {
         remove.innerText = "delete meme";
         remove.name = "delete";
         remove.dataset.id = meme.id;
         edit.innerText = "edit meme"
         edit.name = "edit";
         edit.dataset.id = meme.id;
      } 
      
      [ image, divUpper, divLower, remove, edit ].forEach( 
         element => container.appendChild(element) 
      );
      return container;
   }
 
   function setThemeTo(theme) {
      ({ body, button, label } = getThemeElements());
      if (theme === "dark") {
         body.classList.add("dark");
         button.classList.remove("dark");
         label.innerText = "light";
      } else {
         body.classList.remove("dark");
         button.classList.add("dark");
         label.innerText = "dark";
      }
   }

   function setMemeFormInput(meme) {
      ({ id, url, upperText, lowerText } = getMemeFormElements());
      id.value = meme.id;
      url.value = meme.url;
      upperText.value = meme.upperText;
      lowerText.value = meme.lowerText;
   }

   function getMemeFormInput() {
      ({ id, url, upperText, lowerText } = getMemeFormElements());
      return {
         id: parseInt(id.value),
         url: url.value,
         upperText: upperText.value,
         lowerText: lowerText.value
      }
   }

   function clearMemeFormInput() {
      setMemeFormInput({
         id: 0,
         url: "",
         upperText: "",
         lowerText: ""
      });
   }

   function getThemeElements() {
      let body = document.querySelector("body");
      let button = getThemeBarElement();
      let label = getThemeLabelElement();
      return { body, button, label };
   }

   function getThemeBarElement() {
      return document.getElementById("theme-toggle");
   }

   function getThemeLabelElement() {
      return document.querySelector("#theme-toggle span");
   }

   function getPreviewElement() {
      return document.getElementById("preview");
   }

   function getMemeFormElements() {
      let id = document.getElementById("input-id");
      let url = getMemeFormElementUrl();
      let upperText = document.getElementById("input-upper-text");
      let lowerText = document.getElementById("input-lower-text");
      let buttonPost = document.getElementById("submit");
      let buttonRandom = document.getElementById("random");
      let buttonClear = document.getElementById("clear");
      return { id, url, upperText, lowerText, buttonPost, buttonRandom, buttonClear };
   }

   function getMemeFormElementUrl() {
      return document.getElementById("input-url");
   }

   function getMemeContainerElement() {
      return document.getElementById("memes");
   }

   function createMemePostElements() {
      let container = document.createElement("div");
      let image = document.createElement("img");
      let divUpper = document.createElement("span");
      let divLower = document.createElement("span");
      let remove = document.createElement("button");
      let edit = document.createElement("button");
      return { container, image, divUpper, divLower, remove, edit };
   }

  // from: https://stackoverflow.com/a/5717133
  function isValidURL(str) {
     var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
         '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
         '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
         '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
         '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
         '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
     return !!pattern.test(str);
   }

}); // end window load