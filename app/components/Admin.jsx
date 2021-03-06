// admin@car.com
// admin!

import $ from 'jquery';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { map, partial } from 'lodash';
import css from 'classnames';
import { Card, CardText } from 'material-ui/Card';
import { RadioButton, RadioButtonGroup } from 'material-ui/RadioButton';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';

import { EMAIL_REGEX } from 'app/constants/global';
import { addCourseCount, addScore, addLeaderboard, login, loginWithToken, signup, deleteScore } from 'app/api/users';
import { logout, setLoginErrorMessage } from 'app/actions/AppActions';

class Admin extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            email: '',
            isSignup: false,
            leaderboardKey: '',
            password: '',
            repeatPassword: ''
        };

        this.onLoginSignupChange = this.onLoginSignupChange.bind(this);
        this.onLoginSubmit = this.onLoginSubmit.bind(this);
        this.onLogout = this.onLogout.bind(this);
        this.updateTextField = this.updateTextField.bind(this);
    }

    componentWillMount() {
        if (typeof window !== 'undefined') {
            const token = window.localStorage.getItem('christianandreformed:token');

            if (token) {
                this.props.onLoginWithToken({ token });
            }

            document.body.style.background = '#FFF';
        }
    }

    componentDidMount() {
        setTimeout(() => {
            $.ajax({
                url: '/api/global/getfbstats',
                contentType: 'application/json',
                success(response) {
                    try {
                        console.log(JSON.parse(response.body).data[0]);
                    } catch(err) {

                    }
                }
            })
        }, 500);
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.state.showAdmin !== prevState.showAdmin) {
            $('body').css(this.state.showSlideOut ? {
                height: '100vh',
                overflow: 'hidden'
            } : {
                height: 'initial',
                overflow: 'auto'
            });
        }
    }

    onLogout() {
        if (typeof window !== 'undefined') {
            const confirm = window.confirm('Are you sure you want to log out?');

            if (confirm) {
                this.props.onLogout();
            }
        }
    }

    updateTextField(textField, event) {
        this.setState({ [textField]: event.target.value });

        this.props.onSetLoginErrorMessage(null);
    }

    onLoginSignupChange(event) {
        this.setState({
            email: '',
            isSignup: event.target.value === 'signup',
            password: '',
            repeatPassword: ''
        });

        this.props.onSetLoginErrorMessage(null);
    }

    onLoginSubmit(event) {
        if (!event.which || event.which === 13) {
            const { onLogin, onSetLoginErrorMessage, onSignup } = this.props;
            const { email, isSignup, password, repeatPassword } = this.state;

            if (!EMAIL_REGEX.test(email)) {
                onSetLoginErrorMessage('Please enter a valid email.');
                return;
            }

            if (!email || !password) {
                onSetLoginErrorMessage('A field is empty.');
                return;
            }

            if (isSignup && password !== repeatPassword) {
                onSetLoginErrorMessage('Passwords do not match.');
                return;
            }

            isSignup
                ? onSignup({ email, password })
                : onLogin({ email, password });
        }
    }

    renderOverlay() {
        if (!this.state.showSlideOut) { return null; }

        return <div className="overlay" onClick={() => this.setState({ showSlideOut: false })} />;
    }

    renderLogin() {
        const { loginErrorMessage, user } = this.props;
        const { email, isSignup, password, repeatPassword } = this.state;

        return (
            <div className="slide-out-content__login-section">
                <RadioButtonGroup className="slide-out-content__login-radio-container" name="login" defaultSelected="login" onChange={this.onLoginSignupChange}>
                    <RadioButton
                        className="radio-inline"
                        value="login"
                        label="Login"
                    />
                    <RadioButton
                        className="radio-inline"
                        value="signup"
                        label="Signup"
                    />
                </RadioButtonGroup>
                <div>
                    <TextField
                        className="slide-out-content__login-input"
                        errorText={loginErrorMessage ? ' ' : null}
                        hintText="Email"
                        onChange={partial(this.updateTextField, 'email')}
                        onKeyDown={this.onLoginSubmit}
                        type="email"
                        underlineFocusStyle={{ borderColor: '#1E88E5' }}
                        value={email}
                    />
                    <TextField
                        className="slide-out-content__login-input"
                        errorText={loginErrorMessage ? ' ' : null}
                        hintText="Password"
                        onChange={partial(this.updateTextField, 'password')}
                        onKeyDown={this.onLoginSubmit}
                        type="password"
                        underlineFocusStyle={{ borderColor: '#1E88E5' }}
                        value={password}
                    />
                    {
                        isSignup
                            ? (
                                <TextField
                                    className="slide-out-content__login-input"
                                    errorText={loginErrorMessage ? ' ' : null}
                                    hintText="Repeat password"
                                    onChange={partial(this.updateTextField, 'repeatPassword')}
                                    onKeyDown={this.onLoginSubmit}
                                    type="password"
                                    underlineFocusStyle={{ borderColor: '#1E88E5' }}
                                    value={repeatPassword}
                                />
                            )
                            : null
                    }
                    <RaisedButton
                        className="slide-out-content__login-button"
                        label="Submit"
                        primary={true}
                        onClick={this.onLoginSubmit}
                    />
                </div>
            </div>
        );
    }

    renderLoginErrorMessage() {
        const { loginErrorMessage } = this.props;

        if (!loginErrorMessage) { return null; }

        return <div className="slide-out-content__login-error-message">{loginErrorMessage}</div>;
    }

    renderContent() {
        const { appData } = this.props;

        return (
            <div className="admin">
                <span onClick={this.props.onLogout}>Log out</span>
                {
                    map(appData, (value, key) => {
                        if (key.indexOf('/') !== -1) {
                            return (
                                <div key={key}>{key}: {value}</div>
                            );
                        }

                        return null;
                    })
                }
            </div>
        );
    }

    render() {
        const { appData, user } = this.props;
        const { showSlideOut } = this.state;

        if (user === 'admin@car.com' && appData) {
            return this.renderContent();
        }

        if (user === 'admin@car.com') {
            return <h1>Loading admin...</h1>;
        }

        if (!user) {
            return (
                <div>
                    {this.renderLogin()}
                    {this.renderLoginErrorMessage()}
                </div>
            );
        }

        return <span onClick={this.props.onLogout}>Log out</span>;
    }
}

const mapStateToProps = createSelector(
    state => state.app,
    app => ({ ...app })
);

const mapActionsToProps = {
    onAddCourseCount: addCourseCount,
    onAddLeaderboard: addLeaderboard,
    onAddScore: addScore,
    onDeleteScore: deleteScore,
    onLogin: login,
    onLoginWithToken: loginWithToken,
    onLogout: logout,
    onSetLoginErrorMessage: setLoginErrorMessage,
    onSignup: signup
}

export default connect(mapStateToProps, mapActionsToProps)(Admin);
