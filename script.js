window.addEventListener("DOMContentLoaded", () => {
        const ideaForm = new IdeaForm("#idea");
    });
    
    class IdeaForm {
        // Timeout function for submission
        timeout = 0;
    
        constructor(el) {
            this.form = document.querySelector(el);
            this._idea = "";
            this._expanded = false;
            this._state = SubmitState.Default;
    
            this.form?.addEventListener("click", this.toggle.bind(this));
            this.form?.addEventListener("input", this.ideaUpdate.bind(this));
            this.form?.addEventListener("submit", this.ideaSubmit.bind(this));
            document.addEventListener("click", this.outsideToCollapse.bind(this));
            document.addEventListener("keydown", this.escToCollapse.bind(this));
        }
    
        get idea() {
            return this._idea;
        }
        set idea(value) {
            this._idea = value;
    
            const submitBtn = this.form?.querySelector("[type=submit]");
            if (submitBtn) {
                submitBtn.disabled = value.length === 0;
            }
        }
    
        get expanded() {
            return this._expanded;
        }
        set expanded(value) {
            this._expanded = value;
            this.form?.setAttribute("data-expanded", `${value}`);
        }
    
        get state() {
            return this._state;
        }
        set state(value) {
            this._state = value;
    
            const textarea = this.form?.querySelector("#my-idea");
            const submitBtn = this.form?.querySelector("[type=submit]");
    
            if (textarea) {
                textarea.disabled = value !== SubmitState.Default;
            }
            if (submitBtn) {
                if (value === SubmitState.Sending) {
                    submitBtn.textContent = Label.Sending;
                    submitBtn.disabled = true;
                } else if (value === SubmitState.Done) {
                    submitBtn.textContent = Label.Sent;
                } else {
                    submitBtn.textContent = Label.Submit;
                }
            }
        }
    
        outsideToCollapse(e) {
            if (this.state !== SubmitState.Default) return;
    
            let parent = e.target;
            while (parent !== null) {
                if (parent === this.form) {
                    return;
                }
                parent = parent.parentElement;
            }
            this.expanded = false;
        }
    
        escToCollapse(e) {
            if (e.code === "Escape" && this.state === SubmitState.Default) {
                this.expanded = false;
            }
        }
    
        toggle(e) {
            const button = e.target;
            if (button.hasAttribute("data-toggle")) {
                this.expanded = !this.expanded;
                if (this.expanded) {
                    const textarea = this.form?.querySelector("#my-idea");
                    textarea?.focus();
                }
            }
        }
    
        async ideaSubmit(e) {
            e.preventDefault();
            if (this.state !== SubmitState.Default) return;
    
            const delaySending = 1000;
            const delayDone = 600;
            const delayReset = 300;
    
            this.state = SubmitState.Sending;
    
            return await new Promise((resolve) => {
                clearTimeout(this.timeout);
                this.timeout = setTimeout(() => {
                    resolve();
                }, delaySending);
            })
            .then(async () => {
                this.state = SubmitState.Done;
                return await new Promise((resolve) => {
                    clearTimeout(this.timeout);
                    this.timeout = setTimeout(() => {
                        resolve();
                    }, delayDone);
                });
            })
            .then(() => {
                this.expanded = false;
                clearTimeout(this.timeout);
                this.timeout = setTimeout(() => {
                    this.form?.reset();
                    this.idea = "";
                    this.state = SubmitState.Default;
                }, delayReset);
            });
        }
    
        ideaUpdate(e) {
            const textarea = e.target;
            this.idea = textarea.value;
        }
    }
    
    const Label = {
        Sending: "Sending…",
        Sent: "Sent",
        Submit: "Submit"
    };
    
    const SubmitState = {
        Default: 0,
        Sending: 1,
        Done: 2
    };
    