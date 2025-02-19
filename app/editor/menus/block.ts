import {
  BlockQuoteIcon,
  BulletedListIcon,
  CodeIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  HorizontalRuleIcon,
  OrderedListIcon,
  PageBreakIcon,
  TableIcon,
  TodoListIcon,
  ImageIcon,
  StarredIcon,
  WarningIcon,
  InfoIcon,
  LinkIcon,
  AttachmentIcon,
} from "outline-icons";
import { MenuItem } from "@shared/editor/types";
import { Dictionary } from "~/hooks/useDictionary";
import { metaDisplay } from "~/utils/keyboard";

export default function blockMenuItems(dictionary: Dictionary): MenuItem[] {
  return [
    {
      name: "heading",
      title: dictionary.h1,
      keywords: "h1 heading1 title",
      icon: Heading1Icon,
      shortcut: "^ ⇧ 1",
      attrs: { level: 1 },
    },
    {
      name: "heading",
      title: dictionary.h2,
      keywords: "h2 heading2",
      icon: Heading2Icon,
      shortcut: "^ ⇧ 2",
      attrs: { level: 2 },
    },
    {
      name: "heading",
      title: dictionary.h3,
      keywords: "h3 heading3",
      icon: Heading3Icon,
      shortcut: "^ ⇧ 3",
      attrs: { level: 3 },
    },
    {
      name: "separator",
    },
    {
      name: "checkbox_list",
      title: dictionary.checkboxList,
      icon: TodoListIcon,
      keywords: "checklist checkbox task",
      shortcut: "^ ⇧ 7",
    },
    {
      name: "bullet_list",
      title: dictionary.bulletList,
      icon: BulletedListIcon,
      shortcut: "^ ⇧ 8",
    },
    {
      name: "ordered_list",
      title: dictionary.orderedList,
      icon: OrderedListIcon,
      shortcut: "^ ⇧ 9",
    },
    {
      name: "separator",
    },
    {
      name: "image",
      title: dictionary.image,
      icon: ImageIcon,
      keywords: "picture photo",
    },
    {
      name: "link",
      title: dictionary.link,
      icon: LinkIcon,
      shortcut: `${metaDisplay} k`,
      keywords: "link url uri href",
    },
    {
      name: "attachment",
      title: dictionary.file,
      icon: AttachmentIcon,
      keywords: "file upload attach",
    },
    {
      name: "table",
      title: dictionary.table,
      icon: TableIcon,
      attrs: { rowsCount: 3, colsCount: 3 },
    },
    {
      name: "blockquote",
      title: dictionary.quote,
      icon: BlockQuoteIcon,
      shortcut: `${metaDisplay} ]`,
    },
    {
      name: "code_block",
      title: dictionary.codeBlock,
      icon: CodeIcon,
      shortcut: "^ ⇧ \\",
      keywords: "script",
    },
    {
      name: "hr",
      title: dictionary.hr,
      icon: HorizontalRuleIcon,
      shortcut: `${metaDisplay} _`,
      keywords: "horizontal rule break line",
    },
    {
      name: "hr",
      title: dictionary.pageBreak,
      icon: PageBreakIcon,
      keywords: "page print break line",
      attrs: { markup: "***" },
    },
    {
      name: "separator",
    },
    {
      name: "container_notice",
      title: dictionary.infoNotice,
      icon: InfoIcon,
      keywords: "notice card information",
      attrs: { style: "info" },
    },
    {
      name: "container_notice",
      title: dictionary.warningNotice,
      icon: WarningIcon,
      keywords: "notice card error",
      attrs: { style: "warning" },
    },
    {
      name: "container_notice",
      title: dictionary.tipNotice,
      icon: StarredIcon,
      keywords: "notice card suggestion",
      attrs: { style: "tip" },
    },
  ];
}
