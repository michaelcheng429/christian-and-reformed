import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { delay, partial } from 'lodash';
import { Card, CardTitle, CardText } from 'material-ui/Card';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import Paper from 'material-ui/Paper';

import CONFESSIONS_CREEDS from 'app/constants/confessions-creeds';
import { LONDON_BAPTIST, LONDON_BAPTIST_NAME } from 'app/constants/london-baptist.js';
import { WESTMINSTER, WESTMINSTER_NAME } from 'app/constants/confession-westminster.js';
import { setApp } from 'app/actions/AppActions';
import AppHeader from 'app/components/AppHeader';
import ContentCard from 'app/components/ContentCard';
import ConfessionsCreedsContentCard from 'app/components/ConfessionsCreeds/content-card';

class ConfessionsCreeds extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            selection: null,
            showContent: false,
            showHeader: true
        };

        this.openUrl = this.openUrl.bind(this);
        this.setParentState = this.setParentState.bind(this);
    }

    componentWillMount() {
        if (typeof window !== 'undefined') {
            document.title = 'Confessions and Creeds: Tools to help you read and compare the historic confessions and creeds more effectively.';
            document.body.style.background = '#B2EBF2';

            const pathname = window.location.pathname;

            if (CONFESSIONS_CREEDS[pathname]) {
                this.setState({ selection: pathname });
                document.title = CONFESSIONS_CREEDS[pathname];
            }
        }
    }

    setParentState(object) {
        this.setState(object);
    }

    openUrl(event, key, value) {
        const { history } = this.props

        this.setState({
            showContent: false
        });

        history.push(value);

        if (typeof window !== 'undefined' && CONFESSIONS_CREEDS[value]) {
            document.title = CONFESSIONS_CREEDS[value];
        }

        delay(() => {
            this.setState({
                selection: value,
                showContent: true
            });
        }, 400);
    }

    renderDropdown() {
        const { selection } = this.state;

        return (
            <Paper className="header__dropdown-card" zDepth={5}>
                <DropDownMenu
                    className="header__dropdown"
                    value={selection}
                    onChange={this.openUrl}
                    style={{ width: 350 }}
                    autoWidth={false}
                >
                    <MenuItem value={null} primaryText="Select a confession or creed" disabled />
                    <MenuItem value="/confessions-creeds/1689-london-baptist-confession" primaryText="1689 London Baptist Confession of Faith" />
                    <MenuItem value="westminster" primaryText="Westminster Confession of Faith" />
                </DropDownMenu>
            </Paper>
        );
    }

    renderContent() {
        const { selection } = this.state;

        if (!this.state.selection) {
            return (
                <Card className="confessions-creeds__content-card">
                    <CardTitle
                        className="confessions-creeds__content-card-title"
                        title="Select a confession or creed above"
                    />
                    <CardText>
                        Confession or creed text will appear here.
                    </CardText>
                </Card>
            );
        }

        let data;
        let name;

        switch (selection) {
            case '/confessions-creeds/1689-london-baptist-confession':
                data = LONDON_BAPTIST;
                name = LONDON_BAPTIST_NAME;
                break;
            default:
                data = [];
                name = 'Select a confession or creed above';
                break;
        }

        return (
            <ConfessionsCreedsContentCard data={data} name={name} />
        );
    }

    render() {
        const { showHeader } = this.state;
        const { selection, showContent } = this.state;

        return (
            <div className="confessions-creeds">
                <AppHeader
                    setParentState={this.setParentState}
                    showHeader={showHeader}
                    title="Confessions/Creeds Explorer"
                    subtitle="Read and study historic confessions and creeds with easy display of Scripture references"
                >
                    {this.renderDropdown()}
                </AppHeader>
                <ContentCard setParentState={this.setParentState} showContent={showContent}>
                    {this.renderContent()}
                </ContentCard>
            </div>
        );
    }
}

export default withRouter(ConfessionsCreeds);
