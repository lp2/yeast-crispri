require(data.table)
require(rjson)
setwd('~/Development/colab/yeast-crispri/gen_data/')

# Do TSS
tss = read.delim2('tss.txt', header=F, stringsAsFactors = F)
orf2tss = tss$V3
names(orf2tss) = tss$V1

json = sprintf('orf2tss = %s', toJSON(orf2tss))
writeLines(json, '../data/orf2tss.json')

dat = as.data.frame( fread('full_features.tab') )
names(dat)[1] = 'Chrm'
names(dat)[4] = 'Seq'
names(dat)[5] = 'Nearest_TSS_ORF'

dat = dat[,c(1,2,4,5,6,7,8,9,11)]

# Make chromosome name an integer instead of string
dat$Chrm = as.integer( as.roman( gsub('chr', '', dat$Chrm) ) )

# Set NaNs to -1
dat$Nucleosome[is.nan(dat$Nucleosome)] = -1
dat$Chromatin_rel_1kb[is.nan(dat$Chromatin_rel_1kb)] = -1

writeLines(toJSON(dat), '../data/dat.json')


df = readRDS('orf_name_dataframe.rds')
df = df[df$orf != df$name & df$orf %in% dat$Nearest_TSS_ORF,]
name2orf = df$orf
names(name2orf) = df$name

orf2name = df$name
names(orf2name) = df$orf

json = toJSON(name2orf)
json = sprintf('var name2orf=%s', json)
writeLines(json, '../data/name2orf.json')


json = toJSON(orf2name)
json = sprintf('var orf2name=%s', json)
writeLines(json, '../data/orf2name.json')

