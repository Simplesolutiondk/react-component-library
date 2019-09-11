import React, {Component} from 'react';

class ModalOverlay extends Component {
    constructor(props) {
		super(props);
        this.handleEscapeButton = this.handleEscapeButton.bind(this);
    }
    
    componentDidMount() {
        document.addEventListener("keydown", this.handleEscapeButton, false);
    }
    
    componentWillUnmount() {
        document.removeEventListener("keydown", this.handleEscapeButton, false);
    }

    handleEscapeButton(e) {
        if (e.keyCode === 27) {
            this.props.close();
        }
    }

    render() {
        if (this.props.isOpen) {
            return (
                <div className="modal-overlay" onClick={this.props.close}></div>
            );
        } else {
            return null;
        }
    }
}

export default ModalOverlay;