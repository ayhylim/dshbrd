import {Component} from "react";
import {Dashboard} from "../../../pages";
import LogoTp from "../../../../public/pictures/logoTp.png";

export default class Setting extends Component {
    render() {
        return (
            <div className="container-root">
                <div className="parent-root">
                    <div className="root">
                        <img src={LogoTp} alt="" />
                        <div className="root-title">
                            <h3>Tyotech | ADMIN</h3>
                        </div>
                    </div>
                <Dashboard></Dashboard>
                </div>
            </div>
        );
    }
}
