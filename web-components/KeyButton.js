function makeTemplate(grid_area){
    const template = document.createElement("template");
    template.innerHTML = `
        <style>
            .box{
                width: 107.25px;
                height: 42.875px;
                min-width: 0;
                min-height: 0;
                background-color: white;
                display: flex;
                justify-content: center;
                align-items: center;
                justify-self: center;
                align-self: center;
                padding: 10%;
                transition: property: background-color, padding;
                transition-duration: .2s;
                transition-timing-function: linear;
            }

            .clicked-box{
                background-color: rgb(38, 146, 51);
                padding: 0%;
            }

            h3{
                color: gray;
            }
        </style>
    
        <div id="box" class="box">
            <h3>
                <slot></slot>
            </h3>
        </div>
    `
    return template
}


class KeyButton extends HTMLElement {
    static observedAttributes = ["key", "gridArea"]

    constructor(){
        super();
        const shadow = this.attachShadow({mode: "open"});
        const template = makeTemplate(this.getAttribute("gridArea"));
        shadow.append(template.content.cloneNode(true));
        this.box = shadow.getElementById("box");
    }

    connectedCallback() {
        // Custom element added to page
        this.box.addEventListener("mouseover", (e) => {
            this.box.classList.add("clicked-box");
        })

        this.box.addEventListener("mouseleave", (e) => {
            this.box.classList.remove("clicked-box");
        })
    }
    
    disconnectedCallback() {
        // Custom element removed from page
    }

    adoptedCallback() {
        // Custom element moved to new page
    }

    attributeChangedCallback(name, oldValue, newValue){
        // Called when attribute is changed
    }
}

customElements.define("key-button", KeyButton);