import { DateField, Show, TextField } from "@refinedev/antd";
import { useShow } from "@refinedev/core";
import { Typography, Tag, Image } from "antd";
import React from "react";
import { getImageUrl } from "../../utils/image";

const { Title } = Typography;

export const BannerShow = () => {
  const { query } = useShow({});
  const { data, isLoading } = query;
  const record = data?.data;

  return (
    <Show isLoading={isLoading}>
      <Title level={5}>{"ID"}</Title>
      <TextField value={record?.id} />

      <Title level={5}>{"图片"}</Title>
      {record?.imgUrl ? (
        <Image
          src={getImageUrl(record.imgUrl)}
          alt="轮播图"
          style={{ maxWidth: "100%", maxHeight: 400 }}
        />
      ) : (
        <TextField value="-" />
      )}

      <Title level={5}>{"标题文案"}</Title>
      <TextField value={record?.text || "-"} />

      <Title level={5}>{"跳转链接"}</Title>
      {record?.link ? (
        <a href={record.link} target="_blank" rel="noopener noreferrer">
          {record.link}
        </a>
      ) : (
        <TextField value="-" />
      )}

      <Title level={5}>{"状态"}</Title>
      {record?.status === 1 ? (
        <Tag color="green">正常</Tag>
      ) : (
        <Tag color="red">关闭</Tag>
      )}

      <Title level={5}>{"创建时间"}</Title>
      <DateField value={record?.createdAt} format="YYYY年MM月DD日 HH:mm:ss" />

      <Title level={5}>{"更新时间"}</Title>
      <DateField value={record?.updatedAt} format="YYYY年MM月DD日 HH:mm:ss" />
    </Show>
  );
};

