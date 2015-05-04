//
//  CUTERentTickePublisher.h
//  currant
//
//  Created by Foster Yin on 4/27/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <Bolts.h>
#import "CUTETicket.h"


@interface CUTERentTickePublisher : NSObject

+ (instancetype)sharedInstance;

- (BFTask *)createTicket:(CUTETicket *)ticket;

- (BFTask *)editTicketExcludeImage:(CUTETicket *)ticket;

- (BFTask *)publishTicket:(CUTETicket *)ticket;

- (BFTask *)deleteTicket:(CUTETicket *)ticket;

@end
