import { DateField, Show, TextField } from "@refinedev/antd";
import { useShow } from "@refinedev/core";
import { Typography, Tag, Image } from "antd";
import React from "react";
import { getImageUrl } from "../../utils/image";

const { Title } = Typography;

export const StoreAddressShow = () => {
  const { query } = useShow({});
  const { data, isLoading } = query;

  const record = data?.data;

  return (
    <Show isLoading={isLoading}>
      <Title level={5}>{"ID"}</Title>
      <TextField value={record?.id} />
      
      <Title level={5}>{"完整地址"}</Title>
      <TextField value={record?.fullAddress} />

      <Title level={5}>{"门店名称/联系人"}</Title>
      <TextField value={record?.user} />

      <Title level={5}>{"微信号"}</Title>
      <TextField value={record?.wechat} />

      <Title level={5}>{"区域地址"}</Title>
      <TextField value={record?.address} />

      <Title level={5}>{"门店图片"}</Title>
      {record?.img ? <Image width={220} src={getImageUrl(record.img)} /> : <TextField value="-" />}
      
      <Title level={5}>{"纬度"}</Title>
      <TextField value={record?.latitude ? record.latitude.toFixed(6) : "-"} />
      
      <Title level={5}>{"经度"}</Title>
      <TextField value={record?.longitude ? record.longitude.toFixed(6) : "-"} />

      <Title level={5}>{"营业时间"}</Title>
      <TextField value={record?.busin || "-"} />

      <Title level={5}>{"联系电话"}</Title>
      <TextField value={record?.mobile || "-"} />

      <Title level={5}>{"默认门店"}</Title>
      {record?.defaultAddress === 1 ? <Tag color="blue">是</Tag> : <Tag>否</Tag>}
      
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
