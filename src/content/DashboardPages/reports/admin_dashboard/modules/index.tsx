import { ModuleContext } from "@/contexts/ModuleContext";
import { DialogTitle, Grid, Typography } from "@mui/material";
import { useContext } from "react";
import quick_links from "./quick_links";
import { ModuleQuickLinkButtonWrapper } from "@/components/DashboardQuickLinkButtonWrapper";
import { useTranslation } from "next-i18next";
import Footer from "@/components/Footer";

const ModulesAdminDashboard = () => {
    const { t }: { t: any } = useTranslation();
    const { selectModule } = useContext(ModuleContext);

    return (
        <>
            {/* <Typography variant="h3" component="h3" pl={4} gutterBottom>
                {t(`${selectModule} Module`)}
            </Typography> */}
            <DialogTitle sx={{ p: 3 }}>
                <Typography variant="h4" gutterBottom textTransform="uppercase">
                    {t(`${selectModule.split('_').join(' ')} Dashboard`)}
                </Typography>
                <Typography variant="subtitle2" >
                    {t('This is ' + selectModule.split('_').join(' ') + ' dashboard page')}
                </Typography>
            </DialogTitle>

            {/* <Typography variant="h4" textTransform="capitalize" >{t(`${selectModule.split('_').join(' ')} Dashboard`)}</Typography> */}
            <Grid minHeight="calc(100vh - 253px)">

                < Grid display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2} >
                    {/* quick links */}
                    < Grid width="100%" display="flex" justifyContent="center" >
                        <Grid sx={{ display: 'flex', flexWrap: "wrap", gap: 2, justifyContent: "center", height: 'fit-content', transition: 'all 5s' }} >
                            {
                                quick_links[selectModule]?.map(({ color, linkUrl, icon, name }, index) => <ModuleQuickLinkButtonWrapper key={index} color={color} linkUrl={linkUrl} icon={icon} name={name} />)
                            }
                        </Grid>
                    </Grid >
                </Grid >
            </Grid>

            <Footer />
        </>
    )
}

export default ModulesAdminDashboard;