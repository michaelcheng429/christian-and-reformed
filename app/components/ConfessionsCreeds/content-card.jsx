import $ from 'jquery';
import React, { Component } from 'react';
import CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';
import css from 'classnames';
import { delay, find, isArray, partial, remove, some } from 'lodash';
import { Card, CardTitle, CardText } from 'material-ui/Card';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import Paper from 'material-ui/Paper';
import ClearIcon from 'material-ui-icons/Clear';

export default class ConfessionsCreedsContentCard extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            selection: 1,
            scriptures: {},
            showText: false
        };

        this.removeScripture = this.removeScripture.bind(this);
        this.onSelect = this.onSelect.bind(this);
        this.showScripture = this.showScripture.bind(this);
        this.showToolTip = this.showToolTip.bind(this);
    }

    componentDidMount() {
        this.setState({ showText: true });
    }

    showToolTip(superscript, scriptures) {

    }

    onSelect(event, key, value) {
        this.setState({ showText: false });

        delay(() => {
            this.setState({
                selection: value,
                showText: true
            });
        }, 400);

    }

    showScripture(index, scripture, superscript) {
        const scriptures = this.state.scriptures;

        if (!scriptures[index]) {
            scriptures[index] = [];
        }

        $.ajax({
            context: this,
            method: 'POST',
            contentType: 'application/json',
            url: '/api/global/getscripture',
            data: JSON.stringify({ scripture }),
            success(response) {
                if (!some(scriptures[index], item => item.scripture === scripture)) {
                    scriptures[index].unshift({
                        scripture,
                        superscript,
                        text: response.body
                    });
                }

                this.setState({ scriptures });
            }
        });
    }

    removeScripture(index, scripture) {
        const { scriptures } = this.state;

        const foundScripture = find(scriptures[index], item => item.scripture === scripture);

        foundScripture.remove = true;

        this.setState({ scriptures });

        delay(() => {
            remove(scriptures[index], item => item.scripture === scripture);
        }, 400);
    }

    renderChapter() {
        const { scriptures, selection, showText } = this.state;
        const { data } = this.props;

        const classnames = css('confessions-creeds__content-card-chapter', {
            'confessions-creeds__content-card-chapter--show': showText
        });

        if (!isArray(data)) {
            return data;
        }

        return (
            <div className={classnames} ref={container => this.container = container}>
                <h2>{`Chapter ${selection}: ${data[selection - 1].title}`}</h2>
                <div className="confessions-creeds__content-card-section">
                    <em>Click superscripts to view Scriptures directly below without leaving the page.</em>
                </div>
                {
                    data[selection - 1].content.map((paragraph, index) => {
                        return (
                            <div key={index} className="confessions-creeds__content-card-section">
                                <div><em><u>Paragraph {index + 1}</u></em></div>
                                {
                                    paragraph.map(section => {
                                        return (
                                            <span key={section.superscript}>
                                                {section.text}
                                                <sup
                                                    className={`confessions-creeds__superscript confessions-creeds__superscript-${section.superscript}`}
                                                    onClick={partial(this.showScripture, index, section.scriptures, section.superscript)}
                                                    onMouseOver={partial(this.showToolTip, section.superscript, section.scriptures)}
                                                    title={section.scriptures}
                                                >
                                                    {`${section.superscript} `}
                                                </sup>
                                            </span>
                                        );
                                    })
                                }
                                {
                                    scriptures[index] && scriptures[index].map((scripture, scriptureTextIndex) => {
                                        return (
                                            <CSSTransitionGroup
                                                key={scripture.scripture}
                                                transitionName="confessionsCreedsScripture"
                                                transitionAppear={true}
                                                transitionAppearTimeout={400}
                                                transitionEnter={true}
                                                transitionEnterTimeout={400}
                                                transitionLeave={true}
                                                transitionLeaveTimeout={400}
                                            >
                                                {
                                                    scripture.remove
                                                        ? null
                                                        : (
                                                            <Card className="scripture-card">
                                                                <CardTitle
                                                                    className="scripture-card__title"
                                                                    title={`${scripture.superscript}) ${scripture.scripture}`}
                                                                />
                                                                <CardText className="scripture-card__text">
                                                                    <div dangerouslySetInnerHTML={{__html: scripture.text}} />
                                                                    <ClearIcon onClick={partial(this.removeScripture, index, scripture.scripture)} />
                                                                </CardText>
                                                            </Card>
                                                        )
                                                }
                                            </CSSTransitionGroup>
                                        );
                                    })
                                }
                            </div>
                        );
                    })
                }
            </div>
        );
    }

    render() {
        const { selection } = this.state;
        const { data, date, name } = this.props;

        const isDataDirect = !isArray(data);

        return (
            <Card className="confessions-creeds__content-card">
                <CardTitle
                    className="confessions-creeds__content-card-title"
                    title={name}
                >
                    {
                        isDataDirect
                            ? null
                            : (
                                <div>
                                    <div className="confessions-creeds__content-card-dropdown-label"> Select a chapter from the dropdown below:</div>
                                    <Paper className="confessions-creeds__chapter-dropdown" zDepth={5}>
                                        <DropDownMenu
                                            className="confessions-creeds__content-card-dropdown"
                                            value={selection}
                                            maxHeight={400}
                                            onChange={this.onSelect}
                                            style={{ width: '100%' }}
                                            autoWidth={false}
                                        >
                                            {
                                                data.map((item, index) => {
                                                    return (
                                                        <MenuItem key={index} value={index + 1} primaryText={`Chapter ${item.chapter}:  ${item.title}`} />
                                                    );
                                                })
                                            }
                                        </DropDownMenu>
                                    </Paper>
                                </div>
                            )
                    }
                </CardTitle>
                <CardText>
                    {this.renderChapter()}
                </CardText>
            </Card>
        );
    }
}
