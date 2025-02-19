import fractionalIndex from "fractional-index";
import { observer } from "mobx-react";
import * as React from "react";
import { useDrop } from "react-dnd";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import Collection from "~/models/Collection";
import Fade from "~/components/Fade";
import Flex from "~/components/Flex";
import { createCollection } from "~/actions/definitions/collections";
import useStores from "~/hooks/useStores";
import useToasts from "~/hooks/useToasts";
import CollectionLink from "./CollectionLink";
import DropCursor from "./DropCursor";
import Header from "./Header";
import PlaceholderCollections from "./PlaceholderCollections";
import SidebarAction from "./SidebarAction";
import { DragObject } from "./SidebarLink";

function Collections() {
  const [isFetching, setFetching] = React.useState(false);
  const [fetchError, setFetchError] = React.useState();
  const { policies, documents, collections } = useStores();
  const { showToast } = useToasts();
  const [expanded, setExpanded] = React.useState(true);
  const isPreloaded = !!collections.orderedData.length;
  const { t } = useTranslation();
  const orderedCollections = collections.orderedData;

  React.useEffect(() => {
    async function load() {
      if (!collections.isLoaded && !isFetching && !fetchError) {
        try {
          setFetching(true);
          await collections.fetchPage({
            limit: 100,
          });
        } catch (error) {
          showToast(
            t("Collections could not be loaded, please reload the app"),
            {
              type: "error",
            }
          );
          setFetchError(error);
        } finally {
          setFetching(false);
        }
      }
    }

    load();
  }, [collections, isFetching, showToast, fetchError, t]);

  const [
    { isCollectionDropping, isDraggingAnyCollection },
    dropToReorderCollection,
  ] = useDrop({
    accept: "collection",
    drop: async (item: DragObject) => {
      collections.move(
        item.id,
        fractionalIndex(null, orderedCollections[0].index)
      );
    },
    canDrop: (item) => {
      return item.id !== orderedCollections[0].id;
    },
    collect: (monitor) => ({
      isCollectionDropping: monitor.isOver(),
      isDraggingAnyCollection: monitor.getItemType() === "collection",
    }),
  });

  const content = (
    <>
      {isDraggingAnyCollection && (
        <DropCursor
          isActiveDrop={isCollectionDropping}
          innerRef={dropToReorderCollection}
          position="top"
        />
      )}
      {orderedCollections.map((collection: Collection, index: number) => (
        <CollectionLink
          key={collection.id}
          collection={collection}
          activeDocument={documents.active}
          prefetchDocument={documents.prefetchDocument}
          canUpdate={policies.abilities(collection.id).update}
          belowCollection={orderedCollections[index + 1]}
        />
      ))}
      <SidebarAction action={createCollection} depth={0} />
    </>
  );

  if (!collections.isLoaded || fetchError) {
    return (
      <Flex column>
        <Header>{t("Collections")}</Header>
        <PlaceholderCollections />
      </Flex>
    );
  }

  return (
    <Flex column>
      <Header onClick={() => setExpanded((prev) => !prev)} expanded={expanded}>
        {t("Collections")}
      </Header>
      {expanded && (
        <Relative>{isPreloaded ? content : <Fade>{content}</Fade>}</Relative>
      )}
    </Flex>
  );
}

const Relative = styled.div`
  position: relative;
`;

export default observer(Collections);
