import { TbLayoutDashboard, TbTargetArrow, TbUsers, TbSettings, TbChartBar, TbCalendar, TbCreditCard, TbWebhook, TbChartDots3, TbUserCog } from 'react-icons/tb'

export type NavigationIcons = Record<string, JSX.Element>

const navigationIcon: NavigationIcons = {
    control:      <TbLayoutDashboard size={18} />,
    dashboard:    <TbChartBar        size={18} />,
    leads:        <TbTargetArrow     size={18} />,
    students:     <TbUsers           size={18} />,
    reports:      <TbChartBar        size={18} />,
    schedule:     <TbCalendar        size={18} />,
    payments:     <TbCreditCard      size={18} />,
    settings:     <TbSettings        size={18} />,
    integrations: <TbWebhook         size={18} />,
    targeting:    <TbChartDots3      size={18} />,
    operators:    <TbUserCog         size={18} />,
    crm:          <TbTargetArrow     size={18} />,
}

export default navigationIcon
