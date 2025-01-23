"use strict";

let useIDRefs = true;
let hidePanels = false;
let targetAndSourceCompilationReadable="";
let targetAndSourceCompilationProcessed="";

function getXpath(el) {
  let currentEl = el;
  let currentElTagName = el.tagName.toLowerCase();
  let parentEl;
  let parentElTagName = "";
  let xpath = "";
  let index = "";
  let separator = "";

  while (currentEl.parentNode) {
    parentEl = currentEl.parentNode;
    if (parentEl.tagName) {
      parentElTagName = parentEl.tagName.toLowerCase();
      const elementsWithSameTagName = parentEl.querySelectorAll(":scope > "+ currentEl.tagName);
      if (elementsWithSameTagName.length > 1) {
        index = "[" + parseInt(Array.from(elementsWithSameTagName).indexOf(currentEl) + 1) + "]";
      } else {
        index = "";
      }
      currentElTagName = currentEl.tagName.toLowerCase();
      let id = currentEl.getAttribute("id");
      if (id && useIDRefs) {
        xpath = '/*[@id="' + id + '"]' + separator + xpath;
      } else {
        xpath = currentElTagName + index + separator + xpath;
      }
      separator = "/";
    }

    currentEl = parentEl;
  }
  if (parentElTagName === "") {
    parentElTagName = currentElTagName;
  }
  xpath = "//" + parentElTagName + index + separator + xpath;

  const xpathSplit = xpath.split("//*");
  if (xpathSplit.length > 1) {
    xpath = xpathSplit[xpathSplit.length - 1];
    xpath = "//*" + xpath;
  }

  return xpath;
}

function getXpathAndSource() {
  let currentEl;
  let parentEl;
  let infoPanel;
  let outputPanelForARC;
  let outputPanelForARC_textarea;
  let outputPanelForARC_textarea_label;
  let outputPanelForARC_input;
  let outputPanelForARC_input_label;
  let outputPanelForARC_closeButton;
  let outputPanelForARCAdded = false;
  let hasRun = false;

  const allEls = document.querySelectorAll("*");

  function downloadReadable(filename, text) {
    const allTargetsFileDownloadLinkReadable = document.querySelector("#allTargetsFileDownloadLinkReadable");
    allTargetsFileDownloadLinkReadable.textContent = "Download the targets (Readable, .txt file)";
    allTargetsFileDownloadLinkReadable.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(text));
    allTargetsFileDownloadLinkReadable.setAttribute("download", filename);
  }

  function downloadProcessed(filename, text) {
    const allTargetsFileDownloadLinkProcessed = document.querySelector("#allTargetsFileDownloadLinkProcessed");
    allTargetsFileDownloadLinkProcessed.textContent = "Download the targets (Processed, .txt file)";
    allTargetsFileDownloadLinkProcessed.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(text));
    allTargetsFileDownloadLinkProcessed.setAttribute("download", filename);
  }

  function addEmptyDownloadLinkReadable() {
    const a = document.createElement("a");
    a.setAttribute("id", "allTargetsFileDownloadLinkReadable");
    a.setAttribute("class", "allTargetsFileDownloadLink");
    a.addEventListener("click", (e) => {
      buildMarkdownFileOutput();
      var prefix = prompt("What SC do these targets relate to? (Filename will be prepended accordingly)");
      allTargetsFileDownloadLinkReadable.setAttribute("download", prefix + "-xpaths-targets-selected---human-readable.txt");
      e.stopPropagation();
    });
    document.body.appendChild(a);
  }

  function addEmptyDownloadLinkProcessed() {
    const a = document.createElement("a");
    a.setAttribute("id", "allTargetsFileDownloadLinkProcessed");
    a.setAttribute("class", "allTargetsFileDownloadLink");
    a.addEventListener("click", (e) => {
      buildMarkdownFileOutput();
      var prefix = prompt("What SC do these targets relate to? (Filename will be prepended accordingly)");
      allTargetsFileDownloadLinkProcessed.setAttribute("download", prefix + "-xpaths-targets-selected---machine-readable.txt");
      e.stopPropagation();
    });
    document.body.appendChild(a);
  }

  function addInfoPanel() {
    infoPanel = document.createElement("div");
    infoPanel.setAttribute("id", "infoPanel");
    infoPanel.setAttribute("role", "status");
    document.body.appendChild(infoPanel);
  }
  function addOutputPanelForARC() {
    function addPanelBehaviours() {
      outputPanelForARC_input.addEventListener("click", (e) => {
        outputPanelForARC_input.select();
        e.stopPropagation();
      });
      outputPanelForARC_textarea.addEventListener("click", (e) => {
        outputPanelForARC_textarea.select();
        e.stopPropagation();
      });

      outputPanelForARC.addEventListener("click", (e) => {
        e.stopPropagation();
      });
      outputPanelForARC_input_label.addEventListener("click", (e) => {
        e.stopPropagation();
      });
      outputPanelForARC_textarea_label.addEventListener("click", (e) => {
        e.stopPropagation();
      });
      outputPanelForARC_closeButton.addEventListener("click", (e) => {
        removeAllTheThings();
      });
    }
    function createLabels() {
      outputPanelForARC_input_label = document.createElement("label");
      outputPanelForARC_input_label.setAttribute("for", "outputPanelForARC_input");
      outputPanelForARC_input_label.textContent = "Xpath locator";

      outputPanelForARC_textarea_label = document.createElement("label");
      outputPanelForARC_textarea_label.setAttribute("for", "outputPanelForARC_textarea");
      outputPanelForARC_textarea_label.textContent = "Source code";
    }
    function createInputs() {
      outputPanelForARC_input = document.createElement("input");
      outputPanelForARC_input.setAttribute("id", "outputPanelForARC_input");

      outputPanelForARC_textarea = document.createElement("textarea");
      outputPanelForARC_textarea.setAttribute("id", "outputPanelForARC_textarea");
      outputPanelForARC_textarea.setAttribute("aria-label", "Source code");
    }
    function createCloseButton() {
      outputPanelForARC_closeButton = document.createElement("button");
      outputPanelForARC_closeButton.setAttribute("type", "button");
      outputPanelForARC_closeButton.textContent = "Close";
    }
    function createInfoPanel() {
      outputPanelForARC = document.createElement("div");
      outputPanelForARC.setAttribute("id", "outputPanelForARC");
      outputPanelForARC.setAttribute("tabindex", "-1");
      outputPanelForARC.setAttribute("role", "region");
      outputPanelForARC.setAttribute("aria-label", "Xpath and Source values");
    }
    function addElementsToInfoPanel() {
      outputPanelForARC.appendChild(outputPanelForARC_input_label);
      outputPanelForARC.appendChild(outputPanelForARC_input);
      outputPanelForARC.appendChild(outputPanelForARC_textarea_label);
      outputPanelForARC.appendChild(outputPanelForARC_textarea);
      outputPanelForARC.appendChild(outputPanelForARC_closeButton);
    }

    createInfoPanel();
    createInputs();
    createLabels();
    createCloseButton();
    addElementsToInfoPanel();
    addPanelBehaviours();

    document.body.appendChild(outputPanelForARC);
    outputPanelForARCAdded = true;
  }
  function removeAllTheThings() {
    outputPanelForARC.remove();
    document.querySelector("#xpathGetterStyles").remove();
  }

  function buildMarkdownFileOutput() {
    downloadReadable("xpaths-targets-selected.txt", targetAndSourceCompilationReadable);
    downloadProcessed("xpaths-targets-selected-processed.txt", targetAndSourceCompilationProcessed);
  }

  function addAppStyles() {
    const xpathGetterStyles = document.createElement("style");
    xpathGetterStyles.setAttribute("id", "xpathGetterStyles");
    xpathGetterStyles.textContent = "#outputPanelForARC button {border:1px solid white;color:white;background:black;}#outputPanelForARC label {color:white;}#outputPanelForARC, #outputPanelForARC * {font-size:20px;font-family:sans-serif;}#outputPanelForARC {position:fixed;bottom:80px;right:20px;padding:20px;background:black;width:50vw;z-index:10000;outline:3px solid white;border-radius:5px;}#outputPanelForARC input, #outputPanelForARC textarea {width:100%;display:block;margin:10px 0;background:white;color:black;}#outputPanelForARC textarea {font-family:monospace;}.tempHighlight{outline:4px solid black!important;outline-offset:-4px!important;-webkit-box-shadow: 0px 0px 0px 4px #fff; box-shadow: 0px 0px 0px 4px #fff;}#infoPanel {z-index:100000;font-size:20px;background:rgba(0,0,0,0.8);color:#fff;font-weight:bold;padding:10px;position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);max-width:50vw;font-family:sans-serif;overflow-wrap: break-word;outline:3px solid white;border-radius:5px;}#infoPanel:empty {visibility:hidden;}#infoPanel code {color:lime}#allTargetsFileDownloadLinkReadable {right:20px;background:rgba(41, 98, 24,0.9);}#allTargetsFileDownloadLinkProcessed {right:400px;background:rgba(135, 48, 167,0.9);outline:3px solid white;border-radius:5px;}.allTargetsFileDownloadLink {position:fixed;bottom:20px;color:white;font-weight:bold;padding:10px;font-family:sans-serif;font-size:16px;z-index:10000;outline:3px solid white;border-radius:5px;}.allTargetsFileDownloadLink:empty{visibility:hidden}#infoPanel kbd {color:yellow;}";
    document.head.appendChild(xpathGetterStyles);
  }


  function getNodeHTML(el) {
    const wrap = document.createElement("span");
    wrap.appendChild(el.cloneNode(true));
    const snippet = wrap.innerHTML;
    return snippet;
  }

  function getNodeDetails(el, e) {
    if (!outputPanelForARCAdded) {
      addOutputPanelForARC();
    }
    buildMarkdownFileOutput();
    unhighlightElement(el);
    outputPanelForARC_input.value = getXpath(el);
    let markup = getNodeHTML(el).replace(' class=""', "");

    const markupSplit = markup.split("\n");
    markup="";
    for (let i=0; i<markupSplit.length; i++){
      if (markupSplit[i].trim()!=="") {
        markup+=markupSplit[i].trim()+"\n";
      }
    }
    // const indented = indent.js(markup, { tabString: "\t" });
    // outputPanelForARC_textarea.value = indented;
    outputPanelForARC_textarea.value = markup;

    targetAndSourceCompilationReadable += getXpath(el) + "\n" + markup + "🔸🔸🔸🔸🔸🔸🔸🔸🔸🔸🔸🔸 END target and source markup 🔸🔸🔸🔸🔸🔸🔸🔸🔸🔸🔸🔸\n";
    targetAndSourceCompilationProcessed += getXpath(el) + "~~~//~~~" + flatten(markup) + "\n";
    console.clear();
    console.log("targetAndSourceCompilationReadable = \n",targetAndSourceCompilationReadable);
  }

  function flatten(string){
   string = string.split("\n").join("\\n");
   return string;
  }

  function hideAllTheThings() {
    if (document.querySelector("#outputPanelForARC")) {
      document.querySelector("#outputPanelForARC").setAttribute("hidden","hidden");
    }
    // if (document.querySelector("#infoPanel")) {
    //   document.querySelector("#infoPanel").setAttribute("hidden","hidden");
    // }
    if (document.querySelector("#allTargetsFileDownloadLinkProcessed")) {
      document.querySelector("#allTargetsFileDownloadLinkProcessed").setAttribute("hidden","hidden");
    }
    if (document.querySelector("#allTargetsFileDownloadLinkReadable")) {
      document.querySelector("#allTargetsFileDownloadLinkReadable").setAttribute("hidden","hidden");
    }
  }
  function showAllTheThings() {
    if (document.querySelector("#outputPanelForARC")) {
      document.querySelector("#outputPanelForARC").removeAttribute("hidden");
    }
    // if (document.querySelector("#infoPanel")) {
    //   document.querySelector("#infoPanel").removeAttribute("hidden");
    // }
    if (document.querySelector("#allTargetsFileDownloadLinkProcessed")) {
      document.querySelector("#allTargetsFileDownloadLinkProcessed").removeAttribute("hidden");
    }
    if (document.querySelector("#allTargetsFileDownloadLinkReadable")) {
      document.querySelector("#allTargetsFileDownloadLinkReadable").removeAttribute("hidden");
    }
  }

  unHighlightAll();
  Array.from(allEls).forEach((el) => {
    el.addEventListener("click", (e) => {
      if (el.getAttribute("id") !== "allTargetsFileDownloadLinkReadable") {
        e.stopPropagation();
        e.preventDefault();
        getNodeDetails(el, e);
        infoPanel.innerHTML = "Values captured for " + getXpath(el);
      }
    });
    el.addEventListener("focus", (e) => {
      indicateCurrentEl(el, e);
    });
    el.addEventListener("mouseover", (e) => {
      indicateCurrentEl(el, e);
    });
    el.addEventListener("mouseout", (e) => {
      unHighlightAll();
    });
    el.addEventListener("blur", (e) => {
      unHighlightAll();
    });
  });

  function unHighlightAll() {
    Array.from(allEls).forEach((el) => {
      unhighlightElement(el);
    });
  }

  function indicateCurrentEl(el, e) {
    currentEl = el;
    e.stopPropagation();
    if (!hasRun) {
      highlightElement(el);
    }
    updateInfoPanel(currentEl);
  }

  function unhighlightElement(el) {
    el.classList.remove("tempHighlight");
  }

  function highlightElement(el) {
    el.classList.add("tempHighlight");
  }

  function updateInfoPanel(el) {
    // console.clear();
    // console.log(getXpath(el));
    infoPanel.innerHTML = getXpath(el);
  }

  function checkKeyPresses() {
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        removeAllTheThings();
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        if (currentEl.parentNode && currentEl.tagName !== "HTML") {
          unhighlightElement(currentEl);
          parentEl = currentEl.parentNode;
          currentEl = parentEl;
          highlightElement(currentEl);
        }
        updateInfoPanel(currentEl);
        infoPanel.textContent = infoPanel.textContent + " 👈 Press Return to get this element's details";
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (currentEl.previousElementSibling) {
          unhighlightElement(currentEl);
          currentEl = currentEl.previousElementSibling;
          indicateCurrentEl(currentEl, e);
        }
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        if (currentEl.nextElementSibling) {
          unhighlightElement(currentEl);
          currentEl = currentEl.nextElementSibling;
          indicateCurrentEl(currentEl, e);
        }
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (currentEl.childNodes.length > 1) {
          unhighlightElement(currentEl);
          let elementNodeFound = false;
          let elementToMoveTo;

          Array.from(currentEl.childNodes).forEach((thisNode) => {
            if (thisNode.nodeType === 1 && !elementNodeFound) {
              elementNodeFound = true;
              elementToMoveTo = thisNode;
            }
          });
          if (elementToMoveTo) {
            currentEl = elementToMoveTo;
            indicateCurrentEl(currentEl, e);
          }
        }
      }
      if (e.key === "x") {
        useIDRefs = !useIDRefs;
        console.log("useIDRefs = ", useIDRefs);
        if (useIDRefs)
          {
            infoPanel.innerHTML = "Using ID refs (where available) to get xpath";
          } else {
            infoPanel.innerHTML = "Using element position in DOM to get xpath";
          }
      }
      if (e.key === "h") {
        console.log("hidePanels = ", hidePanels);
        if (!hidePanels) {
          infoPanel.innerHTML = "Hiding panels temporarily (press h to show again or select an element)";
          hideAllTheThings();
                      
        } else {
          showAllTheThings();
          infoPanel.innerHTML = "Showing panels";
        }
        hidePanels = !hidePanels;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        currentEl.click();
      }
    });
  }
  addAppStyles();
  addInfoPanel();
  addEmptyDownloadLinkReadable();
  addEmptyDownloadLinkProcessed();
  checkKeyPresses();
  infoPanel.innerHTML = "<p>Xpath and Source getter started.</p><ul><li>Hover over on elements on the page, then click when the correct element is highlighted</li><li>Or <kbd>Tab</kbd> to a focusable element on the page and then press the arrow keys to fine tune your selection (choose parent, child and sibling elements in the DOM) and confirm that selection with <kbd>Enter</kbd></li><li>You can toggle the xpath type by pressing <kbd>x</kbd> key</li><li>Show/hide panels and download links by the <kbd>h</kbd> key</li></ul>";
}
getXpathAndSource();
