window.addEventListener("load", function() {

   // start the meme machine
   (function() {
      // set (default) theme
      setThemeTo(loadTheme());
      // post saved memes
      postMemes(loadMemes());
      // set user input events
      setThemeToggleListener();
      setMemeFormListeners();
      setMemePostListeners();
   })();
   
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

   function previewMeme() {
      let container = getPreviewElement();
      let meme = getMemeFormInput();
      container.innerHTML = "";
      if (meme.url) {
         let element = formatMeme(meme);
         container.appendChild(element);
      }
   }

   function previewImageLoading() {
      let container = getPreviewElement();
      let meme = getMemeFormInput();
      container.innerHTML = "";
      meme.url = "img/loading.gif";
      let element = formatMeme(meme);
      container.appendChild(element);
   }

   function clearPreview() {
      let container = getPreviewElement();
      container.innerHTML = "";
   }

   function addOrUpdateMeme(meme) {
      let memes = loadMemes();
      for (let index = 0; index < memes.length; index++) {
         if (memes[index].id === meme.id ) {
            // update meme
            memes[index] = meme;
            saveMemes(memes);
            postMeme(meme, index);
            return;
         }
      }
      // add meme
      memes.unshift(meme);
      saveMemes(memes);
      postMeme(meme);
   }

   function saveMemes(memes) {
      let str = JSON.stringify(memes);
      localStorage.setItem("meme-generator-memes", str);
   }

   function saveTheme(theme) {
      localStorage.setItem("meme-generator-theme", theme);
   }

   function loadTheme() {
      let theme = localStorage.getItem("meme-generator-theme");
      return theme || "light";
   }

   function getMemeById(id) {
      let memes = loadMemes();
      for (let index = 0; index < memes.length; index++) {
         if (memes[index].id === parseInt(id)) {
            return memes[index];
         }
      }
      return {};
   }

   function loadMemes() {
      let str = localStorage.getItem("meme-generator-memes");
      return JSON.parse(str) || [];
   }

   function postMeme(meme, index = undefined) {
      let element = formatMeme(meme);
      let container = getMemeContainerElement();
      if (index === undefined) {
         container.insertBefore(element, container.firstChild);
      } else {
         var postedElement = container.children[index];
         container.replaceChild(element, postedElement);
      }
   }

   function postMemes(memes) {
      for (let i = memes.length - 1; i >= 0; i--) {
         postMeme(memes[i]);
      }
   }

   function clearMemes() {
      let container = getMemeContainerElement();
      container.innerHTML = "";
   }

   function editMeme(id) {
      let meme = getMemeById(id);
      setMemeFormInput(meme);
      previewMeme(meme);
   }
   
   function deleteMeme(id) {
      if (confirm("Are you sure your want to delete this meme?")) {
         let memes = loadMemes();
         for (let index = 0; index < memes.length; index++) {
            if (memes[index].id === parseInt(id)) {
               memes.splice(index, 1)
               break;
            }
         }
         clearMemes();
         saveMemes(memes);
         postMemes(memes);
      }
   }


   function formatMeme(meme) {
      ({ container, image, divUpper, divLower, remove, edit } = createMemePostElements());

      container.classList.add("meme");
      container.setAttribute("id", meme.id);
      image.src = meme.url;
      divUpper.innerText = meme.upperText;
      divUpper.classList.add("upper", "text");
      divLower.innerText = meme.lowerText;
      divLower.classList.add("lower", "text");

      if (meme.id > 0) {
         remove.innerText = "Delete";
         remove.name = "delete";
         remove.dataset.id = meme.id;
         edit.innerText = "Edit"
         edit.name = "edit";
         edit.dataset.id = meme.id;
      } 
      
      [ image, divUpper, divLower, remove, edit ].forEach( 
         element => container.appendChild(element) 
      );
      return container;
   }
  

   function setThemeToggleListener() {
      let themeToggle = getThemeButtonElement();
      themeToggle.addEventListener("click", function() {
         let label = getThemeLabelElement();
         if (label.innerText.toLowerCase() === "light") {
            setThemeTo("light");
            saveTheme("light");
         } else {
            setThemeTo("dark");
            saveTheme("dark");
         }
      })
   }

   function setMemeFormListeners() {
      ({ id, url, upperText, lowerText, buttonPost, buttonRandom, buttonClear } = getMemeFormElements() )

      url.addEventListener("change", function() {
         previewMeme();
      })

      upperText.addEventListener("keyup", function() {
         previewMeme();
      })
      
      lowerText.addEventListener("keyup", function() {
         previewMeme();
      })
      
      buttonPost.addEventListener("click", function(event) {
         event.preventDefault();
         let meme = getMemeFormInput();
         if (meme.id == 0) {
            meme.id = new Date().valueOf();
         }
         addOrUpdateMeme(meme);
         clearPreview();
         clearMemeFormInput();
      });
      
      buttonRandom.addEventListener("click", function(event) {
         event.preventDefault();
         previewImageLoading();
         fetchImageUrl().then( function(imageUrl) {
            let inputUrl = getMemeFormElementUrl();
            inputUrl.value = imageUrl.url;
            previewMeme();
        }).catch( function(error) {
             alert("Oops! Error loading random image.");
        });
      })
      
      buttonClear.addEventListener("click", function(event) {
         event.preventDefault();
         clearPreview();
         clearMemeFormInput();
      })

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
               break;
         }
      })
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

   function setMemeFormInput(meme) {
      ({ id, url, upperText, lowerText } = getMemeFormElements());
      id.value = meme.id;
      url.value = meme.url;
      upperText.value = meme.upperText;
      lowerText.value = meme.lowerText;
   }

   function getThemeElements() {
      let body = document.querySelector("body");
      let button = getThemeButtonElement();
      let label = getThemeLabelElement();
      return { body, button, label };
   }

   function getThemeButtonElement() {
      return document.getElementById("theme-toggle");
   }

   function getThemeLabelElement() {
      return document.querySelector("#theme-toggle span");
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

   function getPreviewElement() {
      return document.getElementById("preview");
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

   async function fetchImageUrl() {
      let imageGeneratorUrls = [
         "https://loremflickr.com/450/450", 
         "https://picsum.photos/450/450",
         "https://source.unsplash.com/random/450x450",
         "https://unsplash.it/450/450"
      ];
      let index = Math.floor(Math.random() * imageGeneratorUrls.length);
      let imagePromise = fetch(imageGeneratorUrls[index]).then( function(response) {
              return response;
          }).catch( function(error) {
              return error;
          });
      return await imagePromise;
  }

}); // end window load