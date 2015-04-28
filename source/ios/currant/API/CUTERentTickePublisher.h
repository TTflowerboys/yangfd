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

- (BFTask *)createTicket:(CUTETicket *)ticket;

- (BFTask *)editTicket:(CUTETicket *)ticket;

- (BFTask *)publishTicket:(CUTETicket *)ticket;

@end
