//
//  CUTEUnfinishedRentTicketListForm.h
//  currant
//
//  Created by Foster Yin on 7/14/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEForm.h"
#import "BFTask.h"

@interface CUTEUnfinishedRentTicketListForm : CUTEForm

@property (strong, nonatomic) NSArray *unfinishedRentTickets;

- (BFTask *)reloadWithCancellationToken:(BFCancellationToken *)cancellationToken;

@end
