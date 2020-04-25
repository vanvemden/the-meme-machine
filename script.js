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
      // update meme preview on input changes
      let input_url = document.getElementById("input-url");
      input_url.addEventListener("change", function(e) {
         previewMeme();
      })
      // post meme 
      let button = document.getElementById("submit");
      button.addEventListener("click", function(e) {
         e.preventDefault();
         let meme = getMemeFormInput();
         if (meme.id == 0) {
            meme.id = new Date().valueOf();
         }
         addOrUpdateMeme(meme);
      });
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

   function previewMeme() {
      let container = document.getElementById("preview");
      let meme = getMemeFormInput();
      let element = formatMeme(meme);
      container.innerHTML = element;
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
      ({ container, image, divUpper, divLower, remove, edit } = getMemePostElements());

      container.classList.add("meme");
      container.setAttribute("id", meme.id);
      image.src = meme.url;
      divUpper.innerText = meme.upperText;
      divUpper.classList.add("upper", "text");
      divLower.innerText = meme.lowerText;
      divLower.classList.add("lower", "text");
      remove.innerText = "Delete";
      remove.name = "delete";
      remove.dataset.id = meme.id;
      edit.innerText = "Edit"
      edit.name = "edit";
      edit.dataset.id = meme.id;

      [ image, divUpper, divLower, remove, edit ].forEach( 
         item => container.appendChild(item) 
      );
      return container;
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
      let url = document.getElementById("input-url");
      let upperText = document.getElementById("input-upper-text");
      let lowerText = document.getElementById("input-lower-text");
      return { id, url, upperText, lowerText };
   }

   function getMemePostElements() {
      let container = document.createElement("div");
      let image = document.createElement("img");
      let divUpper = document.createElement("span");
      let divLower = document.createElement("span");
      let remove = document.createElement("button");
      let edit = document.createElement("button");
      return { container, image, divUpper, divLower, remove, edit };
   }  

}); // end window load