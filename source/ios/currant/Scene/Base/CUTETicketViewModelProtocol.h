//
//  CUTETicketViewModelProtocol.h
//  currant
//
//  Created by Foster Yin on 7/15/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "CUTETicket.h"

@protocol CUTETicketViewModelProtocol <NSObject>

@property (strong, nonatomic) CUTETicket *ticket;

@end
