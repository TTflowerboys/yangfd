//
//  CUTETicketForm.h
//  currant
//
//  Created by Foster Yin on 7/16/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEForm.h"
#import "CUTETicket.h"
#import "BFTask.h"

@interface CUTETicketForm : CUTEForm

@property (strong, nonatomic) CUTETicket *ticket;

- (BFTask *)syncTicketWithUpdateInfo:(NSDictionary *)updateInfo;


@end
