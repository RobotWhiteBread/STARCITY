suppressMessages({library(cmfproperty);library(dplyr)})
d <- read.csv("sales.csv", colClasses=c(PIN="character")); d <- d[d$PTYPE=="Res" & d$INCITY==1,]; d$YR <- 2026
r <- suppressMessages(reformat_data(d,"SALE_PRICE","ASSESSED_VALUE","YR",TRUE))
set.seed(7); a <- as.data.frame(cmfproperty:::monte_carlo_sim(r, 20)); print(round(a[,c("shock_pct","COD","PRD","PRB")],4))
