class KeyButton extends HTMLElement {
    static observedAttributes = ["key", "gridArea","width","height"]

    constructor(){
        super();
        // NOTE:
        // abandoned shadow dom because it wasnt working with the grid
        this.width = this.getAttribute("width") ?? "100%";
        this.height = this.getAttribute("height") ?? "100%";
        this.key = this.getAttribute("key") ?? "^";
        this.gridArea = this.getAttribute("gridArea") ?? "u";
        this.text = this.innerText;

        
        this.classList.add("var")
        this.style.width = this.width;
        this.style.height = this.height;
        this.style.gridArea = this.gridArea;
        this.style.justifySelf = "center";
        this.style.alignSelf = "center";

        this.innerHTML = this.makeTemplate().innerHTML;

        this.eventPress = new CustomEvent("keyButtonEvent", {detail: {key: this.key, press: true}});
        this.eventUnpress = new CustomEvent("keyButtonEvent", {detail: {key: this.key, press: false}});
        this.hover = false;
    }

    makeTemplate(){
        const template = document.createElement("template");
        template.innerHTML = `
            <div class="background-box">
                <div class="box">
                    <div class="key-text no-select">
                        ${this.text}
                    </div>
                </div>
            </div>
        `
        return template;
    }

    connectedCallback() {
        // Custom element added to page
        this.dispatchPress = () => {
            this.style.setProperty("--current-border-width", "5px");
            this.style.setProperty("--box-color", "green");
            document.dispatchEvent(this.eventPress);
        }
        this.dispatchUnpress = () => {
            this.style.setProperty("--current-border-width", (this.hover) ? "2px" : "0px");
            this.style.setProperty("--box-color", "black");
            document.dispatchEvent(this.eventUnpress);
        }
        this.handleKey = (e) => {
            if (e.detail.pressed){
                this.style.setProperty("--current-border-width", "5px");
                this.style.setProperty("--box-color", "green");
            }
            else{
                this.style.setProperty("--current-border-width", (this.hover) ? "2px" : "0px");
                this.style.setProperty("--box-color", "black");

            }
        }

        this.handleHover = () => {
            this.hover = true; 
            this.style.setProperty("--current-border-width","2px")
        }

        this.handleLeave = () => {
            this.hover = false; 
            this.style.setProperty("--current-border-width","0px")
        }

        this.addEventListener("mousedown",this.dispatchPress);
        this.addEventListener("mouseup", this.dispatchUnpress);
        this.addEventListener("mouseleave", this.dispatchUnpress);
        document.addEventListener(this.key, this.handleKey);
        this.addEventListener("mouseover",this.handleHover)
        this.addEventListener("mouseleave",this.handleLeave)

    }
    
    disconnectedCallback() {
        // Custom element removed from page
        this.removeEventListener("mousedown",this.dispatchPress);
        this.removeEventListener("mouseup", this.dispatchUnpress);
        this.removeEventListener("mouseleave", this.dispatchUnpress);
        document.removeEventListener(this.key, this.handleKey);
        this.removeEventListener("mouseover",this.handleHover);
        this.removeEventListener("mouseleave",this.handleLeave);
    }

    adoptedCallback() {
        // Custom element moved to new page
    }

    attributeChangedCallback(name, oldValue, newValue){
        // Called when attribute is changed
    }
}

customElements.define("key-button", KeyButton);