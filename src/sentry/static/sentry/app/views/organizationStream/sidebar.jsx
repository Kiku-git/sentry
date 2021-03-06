import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import _ from 'lodash';
import LoadingIndicator from 'app/components/loadingIndicator';
import {queryToObj, objToQuery} from 'app/utils/stream';
import {t} from 'app/locale';
import StreamTagFilter from './tagFilter';

const TEXT_FILTER_DEBOUNCE_IN_MS = 300;

const StreamSidebar = createReactClass({
  displayName: 'StreamSidebar',

  propTypes: {
    orgId: PropTypes.string.isRequired,

    tags: PropTypes.object.isRequired,
    query: PropTypes.string,
    onQueryChange: PropTypes.func.isRequired,
    loading: PropTypes.bool,
    tagValueLoader: PropTypes.func.isRequired,
  },

  getDefaultProps() {
    return {
      tags: {},
      query: '',
      onQueryChange: function() {},
    };
  },

  getInitialState() {
    const queryObj = queryToObj(this.props.query);
    return {
      queryObj,
      textFilter: queryObj.__text,
    };
  },

  componentWillReceiveProps(nextProps) {
    // If query was updated by another source (e.g. SearchBar),
    // clobber state of sidebar with new query.
    const query = objToQuery(this.state.queryObj);

    if (!_.isEqual(nextProps.query, query)) {
      const queryObj = queryToObj(nextProps.query);
      this.setState({
        queryObj,
        textFilter: queryObj.__text,
      });
    }
  },

  onSelectTag(tag, value) {
    const newQuery = {...this.state.queryObj};
    if (value) {
      newQuery[tag.key] = value;
    } else {
      delete newQuery[tag.key];
    }

    this.setState(
      {
        queryObj: newQuery,
      },
      this.onQueryChange
    );
  },

  onTextChange: function(evt) {
    this.setState({textFilter: evt.target.value});
  },

  debouncedTextChange: _.debounce(function(text) {
    this.setState(
      {
        queryObj: {...this.state.queryObj, __text: text},
      },
      this.onQueryChange
    );
  }, TEXT_FILTER_DEBOUNCE_IN_MS),

  onTextFilterSubmit(evt) {
    evt && evt.preventDefault();

    const newQueryObj = {
      ...this.state.queryObj,
      __text: this.state.textFilter,
    };

    this.setState(
      {
        queryObj: newQueryObj,
      },
      this.onQueryChange
    );
  },

  onQueryChange() {
    const query = objToQuery(this.state.queryObj);
    this.props.onQueryChange && this.props.onQueryChange(query);
  },

  onClearSearch() {
    this.setState(
      {
        textFilter: '',
      },
      this.onTextFilterSubmit
    );
  },

  render() {
    const {loading, orgId, tagValueLoader, tags} = this.props;
    return (
      <div className="stream-sidebar">
        {loading ? (
          <LoadingIndicator />
        ) : (
          <div>
            <div className="stream-tag-filter">
              <h6 className="nav-header">{t('Text')}</h6>
              <form onSubmit={this.onTextFilterSubmit}>
                <input
                  className="form-control"
                  placeholder={t('Search title and culprit text body')}
                  onChange={this.onTextChange}
                  value={this.state.textFilter}
                />
                {this.state.textFilter && (
                  <a className="search-clear-form" onClick={this.onClearSearch}>
                    <span className="icon-circle-cross" />
                  </a>
                )}
              </form>
              <hr />
            </div>

            {_.map(tags, tag => {
              return (
                <StreamTagFilter
                  value={this.state.queryObj[tag.key]}
                  key={tag.key}
                  tag={tag}
                  onSelect={this.onSelectTag}
                  orgId={orgId}
                  tagValueLoader={tagValueLoader}
                />
              );
            })}
          </div>
        )}
      </div>
    );
  },
});

export default StreamSidebar;
