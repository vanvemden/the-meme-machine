window.addEventListener("load", function() {

   // start meme machine
   (function() {
      setThemeTo(loadTheme());
      // post any saved memes
      postMemes(loadMemes());
      // listen for user input
      setThemeToggleListener()
      setMemeFormListeners();
      setMemePostListeners();

   })();
   
   function setThemeTo(theme) {
      ({ body, button, label } = getThemeElements() )
      if (theme === "dark") {
         body.classList.add('dark');
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

   function clearPreview() {
      let container = getPreviewElement();
      container.innerHTML = "";
   }

   function addOrUpdateMeme(meme) {
      let memes = loadMemes();
      for (let i = 0; i < memes.length; i++) {
         if (memes[i].id === meme.id ) {
            memes[i] = meme;
            saveMemes(memes);
            postMeme(meme, i);
            return;
         }
      }
      memes.push(meme);
      saveMemes(memes);
      postMeme(meme);
   }

   function saveMemes(memes) {
      let str = JSON.stringify(memes);
      localStorage.setItem("meme-generator-memes", str);
   }

   function saveTheme(theme) {
      console.log(theme);
      localStorage.setItem("meme-generator-theme", theme);
   }

   function loadTheme() {
      let theme = localStorage.getItem("meme-generator-theme");
      return theme || "light";
   }

   function getMemeById(id) {
      let memes = loadMemes();
      for (let i = 0; i < memes.length; i++) {
         if (memes[i].id === parseInt(id)) {
            return memes[i];
         }
      }
      return {}
   }

   function loadMemes() {
      let str = localStorage.getItem("meme-generator-memes");
      return JSON.parse(str) || [];
   }

   function postMeme(meme, index = undefined) {
      let element = formatMeme(meme);
      let container = document.getElementById("memes");
      if (index === undefined) {
         container.insertBefore(element, container.firstChild);
      } else {
         var posted_element = container.children[index]
         console.log("posted_element", posted_element);
         container.replaceChild(element, posted_element);
      }
   }

   function postMemes(memes) {
      for (let i = 0; i < memes.length; i++) {
         postMeme(memes[i]);
      }
   }

   function clearMemes() {
      let container = document.getElementById("memes");
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
         for (let i = 0; i < memes.length; i++) {
            if (memes[i].id === parseInt(id)) {
               memes.splice(i, 1)
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
      let theme_toggle = document.getElementById("theme-toggle");
      theme_toggle.addEventListener("click", function() {
         let label = document.querySelector("#theme-toggle span");
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
      // form input fields events
      ({ id, url, upperText, lowerText, buttonPost, buttonRandom } = getMemeFormElements() )
      url.addEventListener("change", function(e) {
         previewMeme();
      })

      upperText.addEventListener("keyup", function(e) {
         previewMeme();
      })

      lowerText.addEventListener("keyup", function(e) {
         previewMeme();
      })

      // form button events
      buttonPost.addEventListener("click", function(e) {
         e.preventDefault();
         let meme = getMemeFormInput();
         if (meme.id == 0) {
            meme.id = new Date().valueOf();
         }
         addOrUpdateMeme(meme);
         clearPreview();
      });

      buttonRandom.addEventListener("click", function(e) {
         e.preventDefault();
         fetchImageUrl().then( function(imageUrl) {
            console.log(imageUrl);
            let inputUrl = getMemeFormElementUrl();
            inputUrl.value = imageUrl.url;
            previewMeme();
        }).catch( function(error) {
             alert("Sorry, error loading random image.");
        });
      })
   }

   function setMemePostListeners() {
      let container = document.getElementById("memes");
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
      ({ id, url, upperText, lowerText } = getMemeFormElements() );
      return {
         id: parseInt(id.value),
         url: url.value,
         upperText: upperText.value,
         lowerText: lowerText.value
      }
   }

   function setMemeFormInput(meme) {
      ({ id, url, upperText, lowerText } = getMemeFormElements() );
      id.value = meme.id;
      url.value = meme.url;
      upperText.value = meme.upperText;
      lowerText.value = meme.lowerText;
   }

   function getThemeElements() {
      let body = document.querySelector("body");
      let button = document.getElementById("theme-toggle");
      let label = document.querySelector("#theme-toggle span");
      return { body, button, label };
   }

   function getMemeFormElements() {
      let id = document.getElementById("input-id");
      let url = getMemeFormElementUrl();
      let upperText = document.getElementById("input-upper-text");
      let lowerText = document.getElementById("input-lower-text");
      let buttonPost = document.getElementById("submit");
      let buttonRandom = document.getElementById("random");
      return { id, url, upperText, lowerText, buttonPost, buttonRandom };
   }

   function getMemeFormElementUrl() {
      return document.getElementById("input-url");
   }

   function getPreviewElement() {
      return document.getElementById("preview");
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
      let imageGeneratorUrl = "https://picsum.photos/450/450";
      let imagePromise = fetch(imageGeneratorUrl).then( function(response) {
              return response;
          }).catch( function(error) {
              return error;
          });
      return await imagePromise;
  }


}); // end window load