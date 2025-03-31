class SettingsPage extends HTMLElement{
    static observedAttributes = [];
    constructor(){
        super();
        this.innerHTML = this.make_template().innerHTML;
        this.classList.add("settings-page-container")

    }

    make_template(){
        const template = document.createElement("template");
        template.innerHTML = `
            <button class="settings-drop-down-button" id="settings-button">Settings</button>
            <div class="settings-page hidden" id="settings-page">
                <div class="settings-sub-group-container">
                    <div class="settings-title">
                        Game Settings
                    </div>
                    <div class="settings-input">
                        <div class="flex-center" style="width: 100%; height: 100%">
                            <div class="input-title">Player Move Speed:</div>
                        </div>
                        <div class="flex-center" style="width: 100%; height: 100%">
                            <input type="number" min="0" step="0.50" class="input-title" id="input-player-move-speed" style="width: 100%;">
                        </div>
                    </div>
                    
                    <div class="settings-input">
                        <div class="flex-center" style="width: 100%; height: 100%">
                            <div class="input-title">Player Rotate Speed:</div>
                        </div>
                        <div class="flex-center" style="width: 100%; height: 100%">
                            <input type="number" min="0" step="0.01" class="input-title" id="input-player-rotate-speed" style="width: 100%;">
                        </div>
                    </div>
                </div>


                <div class="settings-sub-group-container">
                    <div class="settings-title">
                        Render Settings
                    </div>
                    <div class="settings-input">
                        <div class="flex-center" style="width: 100%; height: 100%">
                            <div class="input-title">Render Distance:</div>
                        </div>
                        <div class="flex-center" style="width: 100%; height: 100%">
                            <input type="number" class="input-title" id="input-render-distance" style="width: 100%;">
                        </div>
                    </div>
                    
                    <div class="settings-input">
                        <div class="flex-center" style="width: 100%; height: 100%">
                            <div class="input-title">Horizon:</div>
                        </div>
                        <div class="flex-center" style="width: 100%; height: 100%">
                            <input type="number" class="input-title" id="input-horizon" style="width: 100%;">
                        </div>
                    </div>

                    <div class="settings-input">
                        <div class="flex-center" style="width: 100%; height: 100%">
                            <div class="input-title">Vision Field (degrees):</div>
                        </div>
                        <div class="flex-center" style="width: 100%; height: 100%">
                            <input type="number" class="input-title" id="input-vision-field" style="width: 100%;">
                        </div>
                    </div>

                    <div class="settings-input">
                        <div class="flex-center" style="width: 100%; height: 100%">
                            <div class="input-title">Background Color:</div>
                        </div>
                        <div class="flex-center" style="width: 100%; height: 100%">
                            <input type="color" class="input-title" id="input-background-color" style="width: 100%;">
                        </div>
                    </div>
                </div>

            </div>
        `
        return template;
    }

    connectedCallback() {
        // Custom element added to page
        this.settings_button = document.getElementById("settings-button");
        this.settings_page = document.getElementById("settings-page");
        this.distance_input = document.getElementById("distance_input");
        this.settings_open = false;

        this.settings_button.addEventListener("click",() => {
            
            this.settings_open = !this.settings_open;
            if (this.settings_open){
                this.settings_page.classList.add("visible");
            }
            else{
                this.settings_page.classList.remove("visible");
            }
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

customElements.define("settings-page", SettingsPage);