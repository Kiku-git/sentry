import PropTypes from 'prop-types';
import React from 'react';
import styled from 'react-emotion';
import {Box} from 'grid-emotion';

import {addErrorMessage, addSuccessMessage} from 'app/actionCreators/indicator';
import {t} from 'app/locale';
import AsyncComponent from 'app/components/asyncComponent';
import Avatar from 'app/components/avatar';
import EventOrGroupHeader from 'app/components/eventOrGroupHeader';
import LinkWithConfirmation from 'app/components/links/linkWithConfirmation';
import Tooltip from 'app/components/tooltip';
import {Panel, PanelItem} from 'app/components/panels';
import EmptyMessage from 'app/views/settings/components/emptyMessage';

class GroupTombstoneRow extends React.Component {
  static propTypes = {
    data: PropTypes.object.isRequired,
    onUndiscard: PropTypes.func.isRequired,
  };

  render() {
    const {data, onUndiscard} = this.props,
      actor = data.actor;

    return (
      <PanelItem align="center">
        <StyledBox>
          <EventOrGroupHeader
            includeLink={false}
            hideIcons={true}
            className="truncate"
            data={data}
          />
        </StyledBox>
        <Box w={20} mx={30}>
          {actor && (
            <Avatar
              user={data.actor}
              hasTooltip
              tooltip={t('Discarded by %s', actor.name || actor.email)}
            />
          )}
        </Box>
        <Box w={30}>
          <Tooltip title={t('Undiscard')}>
            <LinkWithConfirmation
              className="group-remove btn btn-default btn-sm"
              message={t(
                'Undiscarding this issue means that ' +
                  'incoming events that match this will no longer be discarded. ' +
                  'New incoming events will count toward your event quota ' +
                  'and will display on your issues dashboard. ' +
                  'Are you sure you wish to continue?'
              )}
              onConfirm={() => {
                onUndiscard(data.id);
              }}
            >
              <span className="icon-trash undiscard" />
            </LinkWithConfirmation>
          </Tooltip>
        </Box>
      </PanelItem>
    );
  }
}

class GroupTombstones extends AsyncComponent {
  static propTypes = {
    orgId: PropTypes.string.isRequired,
    projectId: PropTypes.string.isRequired,
  };

  getEndpoints() {
    const {orgId, projectId} = this.props;
    return [['tombstones', `/projects/${orgId}/${projectId}/tombstones/`]];
  }

  handleUndiscard = tombstoneId => {
    const {orgId, projectId} = this.props;
    const path = `/projects/${orgId}/${projectId}/tombstones/${tombstoneId}/`;
    this.api.request(path, {
      method: 'DELETE',
      success: data => {
        addSuccessMessage(t('Events similar to these will no longer be filtered'));
      },
      error: () => {
        addErrorMessage(t('We were unable to undiscard this issue'));
      },
    });
    this.fetchData();
  };

  renderEmpty() {
    return (
      <Panel>
        <EmptyMessage>{t('You have no discarded issues')}</EmptyMessage>
      </Panel>
    );
  }

  renderBody() {
    const {tombstones} = this.state;

    return tombstones.length ? (
      <Panel>
        {tombstones.map(data => {
          return (
            <GroupTombstoneRow
              key={data.id}
              data={data}
              onUndiscard={this.handleUndiscard}
            />
          );
        })}
      </Panel>
    ) : (
      this.renderEmpty()
    );
  }
}

const StyledBox = styled(Box)`
  flex: 1;
  min-width: 0; /* keep child content from stretching flex item */
`;

export default GroupTombstones;
